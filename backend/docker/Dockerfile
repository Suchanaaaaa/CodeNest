
FROM debian:bookworm-slim

# Install C, C++ and Java compilers
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    openjdk-17-jdk-headless \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -u 10001 runner

# Working directory
WORKDIR /workspace

# Use non-root user
USER runner
