/**
 * Custom Swagger UI JavaScript for automatic token handling
 * This script automatically extracts tokens from login responses
 * and handles token refresh
 */

(function() {
    'use strict';
    
    // Wait for Swagger UI to load
    window.addEventListener('load', function() {
        // Wait a bit for Swagger UI to fully initialize
        setTimeout(initTokenHandler, 1000);
    });
    
    function initTokenHandler() {
        console.log('Initializing automatic token handler...');
        
        // Store tokens
        let accessToken = localStorage.getItem('swagger_access_token');
        let refreshToken = localStorage.getItem('swagger_refresh_token');
        
        // Auto-fill authorization if token exists
        if (accessToken) {
            setAuthorization(accessToken);
        }
        
        // Intercept login response
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                // Clone response to read it
                const clonedResponse = response.clone();
                
                // Check if this is a login request
                if (args[0] && args[0].includes && args[0].includes('/auth/login')) {
                    clonedResponse.json().then(data => {
                        if (data.access_token) {
                            accessToken = data.access_token;
                            refreshToken = data.refresh_token;
                            
                            // Store in localStorage
                            localStorage.setItem('swagger_access_token', accessToken);
                            if (refreshToken) {
                                localStorage.setItem('swagger_refresh_token', refreshToken);
                            }
                            
                            // Auto-authorize
                            setAuthorization(accessToken);
                            
                            // Show notification
                            showNotification('✓ Token saved and authorized automatically!', 'success');
                        }
                    }).catch(() => {});
                }
                
                // Check if this is a refresh request
                if (args[0] && args[0].includes && args[0].includes('/auth/refresh')) {
                    clonedResponse.json().then(data => {
                        if (data.access_token) {
                            accessToken = data.access_token;
                            localStorage.setItem('swagger_access_token', accessToken);
                            setAuthorization(accessToken);
                            showNotification('✓ Token refreshed automatically!', 'success');
                        }
                    }).catch(() => {});
                }
                
                // Handle 401 errors (token expired)
                if (response.status === 401 && accessToken) {
                    // Try to refresh token
                    if (refreshToken) {
                        refreshAccessToken(refreshToken);
                    } else {
                        showNotification('⚠ Token expired. Please login again.', 'warning');
                    }
                }
                
                return response;
            });
        };
        
        // Add refresh button to Swagger UI
        addRefreshButton();
    }
    
    function setAuthorization(token) {
        // Find the authorize button and click it
        const authBtn = document.querySelector('.btn.authorize');
        if (authBtn) {
            authBtn.click();
            
            // Wait for modal to open
            setTimeout(() => {
                // Find the input field
                const input = document.querySelector('input[placeholder*="Bearer"]') || 
                             document.querySelector('input[type="text"]');
                
                if (input) {
                    // Set the token value
                    input.value = `Bearer ${token}`;
                    
                    // Trigger input event
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // Click authorize button in modal
                    setTimeout(() => {
                        const authorizeBtn = document.querySelector('.auth-btn-wrapper .btn-done');
                        if (authorizeBtn) {
                            authorizeBtn.click();
                        }
                    }, 100);
                }
            }, 300);
        }
    }
    
    function refreshAccessToken(refreshToken) {
        const baseUrl = window.location.origin;
        fetch(`${baseUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                const accessToken = data.access_token;
                localStorage.setItem('swagger_access_token', accessToken);
                setAuthorization(accessToken);
                showNotification('✓ Token refreshed automatically!', 'success');
            } else {
                showNotification('⚠ Refresh failed. Please login again.', 'error');
            }
        })
        .catch(() => {
            showNotification('⚠ Refresh failed. Please login again.', 'error');
        });
    }
    
    function addRefreshButton() {
        // Find the top bar
        const topBar = document.querySelector('.topbar');
        if (!topBar) return;
        
        // Create refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn refresh-token-btn';
        refreshBtn.innerHTML = '🔄 Refresh Token';
        refreshBtn.style.cssText = 'margin-left: 10px; padding: 5px 10px; background: #49cc90; color: white; border: none; border-radius: 4px; cursor: pointer;';
        
        refreshBtn.onclick = function() {
            const refreshToken = localStorage.getItem('swagger_refresh_token');
            if (refreshToken) {
                refreshAccessToken(refreshToken);
            } else {
                showNotification('⚠ No refresh token found. Please login first.', 'warning');
            }
        };
        
        // Add to top bar
        topBar.appendChild(refreshBtn);
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#49cc90' : type === 'error' ? '#f93e3e' : '#fca130'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: sans-serif;
            font-size: 14px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
})();

