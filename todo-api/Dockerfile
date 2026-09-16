FROM ballerina/ballerina:2201.13.5 AS builder
WORKDIR /src
COPY --chown=ballerina:troupe . .
RUN bal build && mv target/bin/*.jar /tmp/service.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /tmp/service.jar /app/service.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "/app/service.jar"]
