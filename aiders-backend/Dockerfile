# Build stage
FROM amazoncorretto:24-jdk AS builder

WORKDIR /app

# Install findutils (contains xargs) - required for Gradle 7.5+
RUN yum update -y && yum install -y findutils && yum clean all

# Copy gradle wrapper and build files first (for better caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x gradlew

# Download dependencies first (this layer will be cached)
RUN ./gradlew dependencies --no-daemon

# Copy source code (separate layer)
COPY src src

# Build the application with build cache
RUN ./gradlew build -x test --no-daemon --build-cache

# Runtime stage - use JDK for better compatibility
FROM amazoncorretto:24-jdk AS runtime

WORKDIR /app

# Copy the built jar from builder stage
COPY --from=builder /app/build/libs/aiders-0.0.1-SNAPSHOT.jar app.jar

# Create non-root user for security (Amazon Linux style)
RUN yum update -y && yum install -y shadow-utils && yum clean all
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check using existing curl-minimal
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/manage/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]