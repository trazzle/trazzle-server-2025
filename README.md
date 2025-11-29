<p align="center">
  <img src="./docs/logo_simbol.png" width="120" alt="Nest Logo" />
</p>

## ERD 다이어그램

![erd](./docs/trazzle-2025-erd.png)

## 프로젝트 운영배포 파이프라인

## Project setup

- Typescript version: `v9.39.1`

> 프로젝트 초기 Docker-Compose
>
> - 목적: 로컬호스트에서도 별도의 소프트웨어 설치없이 빠르게 셋업
> - 로컬호스트에 접근할 수 있도록 DB관련 아이디, 패스워드 필요.
> - `.env` 파일에 있는 환경변수 필요 ([.env.sample](./.env.sample) 파일을 참고해주세요.)
> - `.env` 파일의 환경변수 값은 `@loveAlakazam`에게 문의부탁해주세요!

```bash
# .env : Docker-Compose 에 필요한 환경변수들 셋팅

$ cp .env.sample .env
$ docker-compose up -d
```

데이터베이스 IDE에서 .env에 있는 정보를 활용하여 로컬호스트 환경에서 DB인스턴스 연결해야됩니다.

<br>

> 서버 애플리케이션 개발환경 환경변수 설정하기
>
> - 목적: 서버 애플리케이션 실행을 위해서 반드시 필요한 개발환경변수 셋팅
> - 개발환경은 `NODE_ENV=development` 입니다. 개발환경과 연관된 파일은 `.env.development` 입니다.
> - 운영환경은 `NODE_ENV=production` 입니다. 운영환경과 연관된 파일은 `.env.production` 입니다.
> - 개발환경 .env.development 환경변수값 요청은 `@loveAlakazam`에게 요청해주세요!

```bash
$ cp .env.development.sample .env.development
```

<br>

> 패키지 의존성 설치

```bash
$ yarn install
```

> 개발환경 데이터베이스 스키마 반영

```bash
$ yarn db:push
```

<br>

## 국가/도시 초기 데이터 seeding (개발서버만 해당)

```bash
$ yarn db:seed
```

<br>

## Swagger UI - `localhost:3000/swagger-ui`

<br>

## 데이터베이스 마이그레이션 (개발서버만 해당)

> (1) **스키마 변경사항 업데이트 및 마이그레이션**
>
> - prisma.schema에서 스키마 변경시, 마이그레이션파일 추가 및 디비 즉각 반영
> - 개발서버: `NODE_ENV=development`

```bash
$ yarn db:migrate
```

> (2) **마이그레이션 반영**
>
> - 먼저, git에서 prisma.schema와 migration파일들을 pull을 받은뒤에 실행해주세요.
> - 마이그레이션된 파일들을 연결된 디비에 반영
> - 개발서버: `NODE_ENV=development`

```bash
$ yarn db:pull
```

<br>

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
