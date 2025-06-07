### Private Registry 프로젝트 입니다.

#### 빌드 및 실행
```bash
docker compose up -d
```

#### API 명세

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2` | check health for v2 route |
| GET | `/v2/<name>/manifests/<refs \| tags>` | gets manifest |
| PUT | `/v2/<name>/manifests/<refs \| tags>` | uploads manifest |
| HEAD | `/v2/<name>/blobs/<digest>` | checks blob |
| GET | `/v2/<name>/blobs/<digest>` | gets blob | 
| POST | `/v2/<name>/blobs/uploads` | starts blob upload session |
| PATCH | `/v2/<name>/blobs/uploads/<uuid>` | uploads blob data |
| PUT | `/v2/<name>/blobs/uploads/<uuid>?digest=sha256:<digest>` | ends blob upload session |
| POST | `/users` | adds user |
| GET | `/users/<user-id>` | gets a user |
| DELETE | `/users/<user-id>` | deletes a user |
| GET | `/images` | lists image (with filter func) |
| DELETE | `/images/<image-name>` | deletes a image |
| GET | `/images/<image-name>/tags` | gets tags for image |
| DELETE | `/images/<image-name>/tags/<tag-name>` | deletes tags for image |
| GET | `/audit?user=<user-id>` | gets logs with user id |
| GET | `/audit?image=<image-name>` | gets logs with image name |

#### 기본 유저

`admin:1234`

#### 인증 방법

Basic Auth 방식으로 인증합니다.

```bash
curl -u admin:1234 http://localhost:3000/v2
```

#### 레지스트리 접근 방법

```bash
docker login localhost:5000
```



