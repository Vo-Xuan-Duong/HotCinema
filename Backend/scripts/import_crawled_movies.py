"""Transactionally import legacy HotCinema crawler JSON into MySQL."""

from __future__ import annotations

import argparse
import importlib.util
import os
import sys
import uuid
from pathlib import Path

import pymysql


def load_env(path: Path) -> dict[str, str]:
    values = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def load_mapper(path: Path):
    spec = importlib.util.spec_from_file_location("hotcinema_crawler_push", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load crawler mapper: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def resolve_genre(cursor, mapper, name: str) -> bytes:
    slug = mapper.slugify_text(name)
    cursor.execute("SELECT id FROM genres WHERE slug=%s OR name=%s LIMIT 1", (slug, name))
    row = cursor.fetchone()
    if row:
        return row[0]
    genre_id = uuid.uuid4().bytes
    cursor.execute(
        "INSERT INTO genres (id, name, slug, created_at) VALUES (%s, %s, %s, NOW(6))",
        (genre_id, name, slug),
    )
    return genre_id


def upsert_movie(cursor, payload: dict) -> tuple[bytes, bool]:
    cursor.execute("SELECT id FROM movies WHERE slug=%s", (payload["slug"],))
    row = cursor.fetchone()
    movie_id = row[0] if row else uuid.uuid4().bytes
    created = row is None
    columns = (
        "title", "original_title", "slug", "description", "duration_minutes",
        "release_date", "end_date", "age_rating", "original_language", "director",
        "actors", "country", "production_company", "poster_url", "banner_url",
        "trailer_url", "status",
    )
    values = (
        payload["title"], payload["originalTitle"], payload["slug"], payload["description"],
        payload["durationMinutes"], payload["releaseDate"], payload["endDate"],
        payload["ageRating"], payload["originalLanguage"], payload["director"],
        payload["actors"], payload["country"], payload["productionCompany"],
        payload["posterUrl"], payload["bannerUrl"], payload["trailerUrl"], payload["status"],
    )
    if created:
        cursor.execute(
            f"INSERT INTO movies (id,is_active,created_at,updated_at,{','.join(columns)}) "
            f"VALUES (%s,b'1',NOW(6),NOW(6),{','.join(['%s'] * len(columns))})",
            (movie_id, *values),
        )
    else:
        assignments = ",".join(f"{column}=%s" for column in columns)
        cursor.execute(
            f"UPDATE movies SET {assignments},is_active=b'1',updated_at=NOW(6),deleted_at=NULL WHERE id=%s",
            (*values, movie_id),
        )
    return movie_id, created


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--crawler-mapper", type=Path, required=True)
    parser.add_argument("--env-file", type=Path, default=Path(__file__).parents[1] / ".env")
    parser.add_argument("--status", default="COMING_SOON")
    parser.add_argument("--default-duration", type=int, default=120)
    args = parser.parse_args()

    mapper = load_mapper(args.crawler_mapper.resolve())
    movie_items = mapper.iter_movies_with_people(mapper.load_json(args.input.resolve()))
    if not movie_items:
        raise ValueError("Crawler JSON contains no movie records")
    config = {**load_env(args.env_file), **os.environ}
    connection = pymysql.connect(
        host=config.get("MYSQL_HOST", "localhost"), port=int(config.get("MYSQL_PORT", "3306")),
        user=config.get("MYSQL_USERNAME", "root"), password=config.get("MYSQL_PASSWORD", ""),
        database=config.get("MYSQL_DATABASE", "cinema"), charset="utf8mb4", autocommit=False,
    )
    created = updated = linked = 0
    database_counts = (0, 0, 0)
    skipped: list[tuple[str, str]] = []
    try:
        with connection.cursor() as cursor:
            for movie, people_details in movie_items:
                status = str(movie.get("screening_status") or args.status)
                payload = mapper.build_movie_request(movie, people_details, status, args.default_duration)
                if not payload.get("trailerUrl"):
                    payload["trailerUrl"] = f"https://moveek.com/phim/{payload['slug']}"
                genre_names = mapper.extract_genre_names(movie)
                if not genre_names:
                    skipped.append((payload["title"], "genres"))
                    continue
                invalid = mapper.validate_hotcinema_payload({**payload, "genres": ["resolved"]})
                if invalid:
                    skipped.append((payload["title"], ",".join(invalid)))
                    continue
                genre_ids = [resolve_genre(cursor, mapper, name) for name in genre_names]
                movie_id, was_created = upsert_movie(cursor, payload)
                created += int(was_created)
                updated += int(not was_created)
                cursor.execute("DELETE FROM movie_genres WHERE movie_id=%s", (movie_id,))
                for genre_id in dict.fromkeys(genre_ids):
                    cursor.execute("INSERT INTO movie_genres (genre_id,movie_id) VALUES (%s,%s)", (genre_id, movie_id))
                    linked += 1
        connection.commit()
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM movies")
            movie_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM genres")
            genre_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM movie_genres")
            link_count = cursor.fetchone()[0]
            database_counts = (movie_count, genre_count, link_count)
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
    print(
        f"Processed {len(movie_items)} movies: created={created}, updated={updated}, "
        f"skipped={len(skipped)}, genre_links={linked}"
    )
    for title, reason in skipped:
        print(f"[SKIPPED] {title}: {reason}")
    print(
        f"Database totals: movies={database_counts[0]}, genres={database_counts[1]}, "
        f"movie_genres={database_counts[2]}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
