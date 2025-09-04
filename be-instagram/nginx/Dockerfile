# Simple nginx configuration for API server only
FROM nginx:1.25-alpine

# Install necessary packages
RUN apk add --no-cache curl

# Copy nginx configuration
COPY conf/app.conf /etc/nginx/conf.d/default.conf

# Create nginx log directory
RUN mkdir -p /var/log/nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
