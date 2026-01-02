package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.auth.requests.RefreshTokenRequest;
import com.example.hotcinemas_be.dtos.auth.responses.RefreshTokenResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.RefreshTokenMapper;
import com.example.hotcinemas_be.models.RefreshToken;
import com.example.hotcinemas_be.repositorys.RefreshTokenRepository;
import com.example.hotcinemas_be.repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenMapper refreshTokenMapper;
    private final UserRepository userRepository;


    public void addRefreshToken(String email, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(userRepository.findByEmail(email)
                        .orElseThrow(() -> new AppException("User not found", ErrorCode.MODEL_NOT_FOUND)))
                .build();
        refreshTokenMapper.mapToResponse(refreshTokenRepository.save(refreshToken));
    }

    public List<RefreshTokenResponse> getAllRefreshTokens(Pageable pageable) {
        List<RefreshToken> refreshTokens = refreshTokenRepository.findAll(pageable).getContent();
        if (refreshTokens.isEmpty()) {
            throw new AppException("No refresh tokens found", ErrorCode.MODEL_NOT_FOUND);
        }
        return refreshTokens.stream()
                .map(refreshTokenMapper::mapToResponse)
                .toList();
    }

    public void deleteRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppException("Refresh token not found", ErrorCode.MODEL_NOT_FOUND));
        refreshTokenRepository.delete(refreshToken);
    }

    public RefreshTokenResponse getRefreshTokenById(Long tokenId) {
        RefreshToken refreshToken = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new AppException("Refresh token not found", ErrorCode.MODEL_NOT_FOUND));
        return refreshTokenMapper.mapToResponse(refreshToken);
    }

    public boolean existsByTokenId(Long tokenId) {
        return refreshTokenRepository.existsById(tokenId);
    }
}
