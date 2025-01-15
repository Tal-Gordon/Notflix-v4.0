FROM gcc:latest

RUN apt-get update && apt-get install -y cmake

WORKDIR /Notflix
ARG BUILD_TESTS=OFF

COPY CMakeLists.txt .
COPY src/ src/
COPY tests/ tests/

RUN mkdir build \
    && cd build \
    && cmake -DBUILD_TESTS=${BUILD_TESTS} .. \
    && make \
    && ls -l /Notflix/build \
    && cp /Notflix/build/main /Notflix/main

RUN ls -l /Notflix

WORKDIR /Notflix

CMD ["./main"]