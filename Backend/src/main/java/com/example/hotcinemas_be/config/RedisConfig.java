package com.example.hotcinemas_be.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableRedisRepositories
public class RedisConfig {

        /**
         * ObjectMapper dành riêng cho Redis:
         * - Hỗ trợ JavaTime (LocalDate, LocalDateTime, ...)
         * - Bật default typing để cache có đủ type info cho mọi object (kể cả
         * records/final)
         * - Tránh LinkedHashMap cast lỗi khi deserialize PageResponse
         *
         * Lưu ý: Dùng DefaultTyping.EVERYTHING (dù bị đánh dấu deprecated) để đảm bảo
         * cả PageResponse (record, final) cũng có type info khi serialize.
         */
        @Bean
        public ObjectMapper redisObjectMapper() {
                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new JavaTimeModule());
                mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                                .allowIfSubType(Object.class)
                                .build();

                mapper.activateDefaultTyping(
                                ptv,
                                ObjectMapper.DefaultTyping.EVERYTHING,
                                JsonTypeInfo.As.PROPERTY);

                return mapper;
        }

        @Bean
        public RedisTemplate<String, Object> redisTemplate(
                        RedisConnectionFactory connectionFactory,
                        ObjectMapper redisObjectMapper) {
                RedisTemplate<String, Object> template = new RedisTemplate<>();
                template.setConnectionFactory(connectionFactory);

                GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(
                                redisObjectMapper);

                template.setKeySerializer(new StringRedisSerializer());
                template.setValueSerializer(serializer);
                template.setHashKeySerializer(new StringRedisSerializer());
                template.setHashValueSerializer(serializer);

                template.afterPropertiesSet();
                return template;
        }

        @Bean
        public RedisCacheManager redisCacheManager(
                        RedisConnectionFactory connectionFactory,
                        ObjectMapper redisObjectMapper) {
                GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(
                                redisObjectMapper);

                RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                                .serializeKeysWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new StringRedisSerializer()))
                                .serializeValuesWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                                .entryTtl(Duration.ofMinutes(10)); // TTL tuỳ chỉnh

                return RedisCacheManager.builder(connectionFactory)
                                .cacheDefaults(config)
                                .build();
        }
}
