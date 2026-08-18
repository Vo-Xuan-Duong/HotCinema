import { describe, expect, it } from 'vitest';
import { toGenrePayload } from './genreService';

describe('genreService dto adapter', () => {
  it('maps only the required backend genre fields', () => {
    expect(toGenrePayload({
      name: ' Hành động ',
      slug: ' hanh-dong ',
      description: 'field not accepted by GenreCreateRequest',
    })).toEqual({
      name: 'Hành động',
      slug: 'hanh-dong',
    });
  });
});
