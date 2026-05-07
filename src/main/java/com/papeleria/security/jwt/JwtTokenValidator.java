package com.papeleria.security.jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenValidator {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    public boolean isTokenValid(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        return tokenProvider.validateToken(token);
    }
    
    public String getUsernameFromToken(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenProvider.getUsernameFromToken(token);
    }
}
