<p align="center">
  <img src="./docs/logo_simbol.png" width="120" alt="Nest Logo" />
</p>

## ERD 다이어그램

![erd](./docs/trazzle-2025-erd.png)

## 프로젝트 운영배포 파이프라인

## Project setup

> 프로젝트 초기 Docker-Compose
>
> - 목적: 로컬호스트에서도 별도의 소프트웨어 설치없이 빠르게 셋업
> - 로컬호스트에 접근할 수 있도록 DB관련 아이디, 패스워드 필요.
> - `.env` 파일에 있는 환경변수 필요 ([.env.sample](./.env.sample) 파일을 참고해주세요.)

```bash
# .env : Docker-Compose 에 필요한 환경변수들 셋팅

$ cp .env.sample .env
$ docker-compose up -d
```

<br>

> 패키지 의존성 설치

```bash
yarn install
```

<br>

## 국가/도시 초기 데이터 seeding (개발서버만 해당)

```bash
yarn db:seed
```

<br>

## 데이터베이스 마이그레이션 (개발서버만 해당)

> (1) **스키마 변경사항 업데이트 및 마이그레이션**
>
> - prisma.schema에서 스키마 변경시, 마이그레이션파일 추가 및 디비 즉각 반영
> - 개발서버: `NODE_ENV=development`

```bash
yarn db:migrate
```

> (2) **마이그레이션 반영**
>
> - 먼저, git에서 prisma.schema와 migration파일들을 pull을 받은뒤에 실행해주세요.
> - 마이그레이션된 파일들을 연결된 디비에 반영
> - 개발서버: `NODE_ENV=development`

```bash
yarn db:pull
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
