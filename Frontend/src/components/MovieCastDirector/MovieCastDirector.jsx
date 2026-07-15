import React from 'react';
import './MovieCastDirector.css';

const MovieCastDirector = ({ actors = [], director = '', title = 'Thông tin ekip' }) => {
    if (!actors.length && !director) {
        return null;
    }

    return (
        <div className="movie-cast-director-wrapper">
            <h3 className="cast-director-title">{title}</h3>

            <div className="cast-director-content">
                {/* Director Section */}
                {director && (
                    <div className="cast-director-item director-item">
                        <span className="cast-director-label">Đạo diễn:</span>
                        <span className="cast-director-value director-name">{director}</span>
                    </div>
                )}

                {/* Actors Section */}
                {actors.length > 0 && (
                    <div className="cast-director-item actors-item">
                        <span className="cast-director-label">Diễn viên:</span>
                        <div className="actors-list">
                            {actors.map((actor, index) => (
                                <span key={index} className="actor-badge">
                                    {actor}
                                    {index < actors.length - 1 && <span className="actor-separator">,</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCastDirector;
