# Phase 1 Render 배포 준비 문서

## 1. 작업 목표

Phase 1 백엔드와 프론트엔드를 Render에 배포하기 위한 준비 기준을 정리한다.

이 문서는 Render 배포 순서, 환경변수 설정, CORS 설정, Free 티어 고려사항, 배포 전 체크리스트를 명확히 해 포트폴리오 시연 전 점검 기준으로 사용한다.

## 2. 전제 조건과 참고 문서

### 2.1 전제 조건

이전 단계 커밋 완료:

- Phase 1 백엔드 mock 추천 API 구현 완료
- Phase 1 프론트엔드 Next.js 화면 구현 완료
- 프론트엔드 UI 2차 개선 완료

이번 문서 작업에서는 백엔드 코드, 프론트엔드 코드, `frontend/phase1/package.json`을 수정하지 않는다.

### 2.2 참고 문서

참고 문서:

- `backend/phase1/README.md`
- `frontend/phase1/README.md`
- `docs/phase1/api-spec.md`
- `docs/phase1/ai-policy.md`
- `docs/phase1/local-runbook.md`

`docs/phase1/local-runbook.md`는 실제 파일 존재 여부를 확인한 뒤 참고한다. 현재 Repo에는 해당 파일이 존재하므로 참고 문서에 포함한다. 존재하지 않는 문서는 참고 문서로 확정하지 않는다.

## 3. Render 서비스 구성

Phase 1은 Render에서 백엔드 Web Service와 프론트엔드 Web Service를 분리해 배포하는 구성을 권장한다.

| 구분 | 서비스 유형 | 대상 경로 | 역할 |
| --- | --- | --- | --- |
| 백엔드 | Web Service | `backend/phase1` | 추천 API 제공 |
| 프론트엔드 | Web Service | `frontend/phase1` | Next.js 화면 제공 |

### 3.1 권장 배포 순서

Render 배포는 백엔드와 프론트엔드 URL이 서로 필요하므로 아래 순서를 권장한다.

1. 백엔드 Web Service를 먼저 배포한다.
2. 백엔드 Render URL을 확보한다.
3. 프론트엔드 Web Service를 배포할 때 `NEXT_PUBLIC_API_BASE_URL`에 백엔드 Render URL을 입력한다.
4. 프론트엔드 Render URL을 확보한다.
5. 백엔드 환경변수 `ALLOWED_ORIGINS`에 프론트엔드 Render URL을 입력한다.
6. 백엔드를 재배포하거나 환경변수 변경을 반영한다.
7. 프론트엔드에서 추천 API 호출과 CORS 오류 여부를 확인한다.

프론트엔드 URL과 백엔드 URL은 서로 참조 관계가 있으므로, 최초 배포 시에는 백엔드를 먼저 배포한 뒤 프론트엔드 환경변수를 설정하고, 이후 백엔드 CORS 환경변수를 다시 보완하는 순서가 안전하다.

## 4. 백엔드 배포 설정

| 항목 | 권장값 |
| --- | --- |
| Root Directory | `backend/phase1` |
| Runtime | Python |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

백엔드 환경변수는 실제 배포 시점의 설정 기준에 맞춘다. 프론트엔드 Render URL을 확보한 뒤 `ALLOWED_ORIGINS`에 해당 origin을 반영한다.

## 5. 프론트엔드 배포 설정

| 항목 | 권장값 |
| --- | --- |
| Root Directory | `frontend/phase1` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| 주요 환경변수 | `NEXT_PUBLIC_API_BASE_URL=<백엔드 Render URL>` |

`npm run start`를 사용하려면 `package.json`에 `"start": "next start"`가 있어야 한다. 없을 경우 Render 배포가 실패할 수 있으므로 배포 전 확인한다.

### 5.1 package.json start script 확인

Render에서 Next.js 앱을 Web Service로 실행하려면 `frontend/phase1/package.json`에 `start` script가 필요하다.

배포 전 아래 항목을 확인한다.

```json
{
  "scripts": {
    "start": "next start"
  }
}
```

현재 문서 작성 작업에서는 `package.json`을 수정하지 않는다. 만약 `start` script가 없다면, 실제 배포 작업 전에 별도 수정 지시문으로 추가한다.

## 6. 환경변수 기준

### 6.1 백엔드

| 환경변수 | 설명 |
| --- | --- |
| `APP_ENV` | 배포 환경 구분 |
| `ALLOWED_ORIGINS` | 백엔드가 허용할 프론트엔드 origin 목록 |

### 6.2 프론트엔드

| 환경변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 프론트엔드가 호출할 백엔드 API base URL |

프론트엔드에는 OpenAI API Key, 금융감독원 API Key 등 민감 정보를 작성하지 않는다.

## 7. CORS 설정 기준

백엔드 `ALLOWED_ORIGINS`에는 프론트엔드 Render URL의 origin을 설정한다. 예시는 아래와 같다.

```env
ALLOWED_ORIGINS=https://your-frontend-service.onrender.com
```

### 7.1 CORS 설정 순서

1. 백엔드 Render URL을 먼저 확보한다.
2. 프론트엔드 Render 환경변수 `NEXT_PUBLIC_API_BASE_URL`에 백엔드 URL을 설정한다.
3. 프론트엔드 배포 후 프론트엔드 Render URL을 확인한다.
4. 백엔드 Render 환경변수 `ALLOWED_ORIGINS`에 프론트엔드 URL을 설정한다.
5. 백엔드를 재배포하거나 환경변수 변경을 반영한다.
6. 브라우저 콘솔에서 CORS 오류가 없는지 확인한다.

`NEXT_PUBLIC_API_BASE_URL`은 프론트엔드가 백엔드를 호출하기 위한 값이고, `ALLOWED_ORIGINS`는 백엔드가 허용할 프론트엔드 origin이다. 두 값은 서로 다르므로 혼동하지 않는다.

## 8. 배포 후 확인 시나리오

1. 프론트엔드 Render URL에 접속한다.
2. GNB와 Phase 1 화면이 표시되는지 확인한다.
3. 추천 조건을 입력한다.
4. 추천 요청 버튼을 클릭한다.
5. 추천 결과 카드가 표시되는지 확인한다.
6. 브라우저 콘솔과 Network 탭에서 API 오류 또는 CORS 오류가 없는지 확인한다.

## 9. Render Free 티어 고려사항

| 항목 | 고려사항 |
| --- | --- |
| 슬립 모드 | 비활성 상태 후 첫 요청이 느릴 수 있음 |
| 리소스 제한 | CPU, 메모리, 빌드 시간 제한을 고려해 경량 구성을 유지 |
| 외부 API 호출 | Phase 1은 mock API 기준이며 실제 외부 API 호출은 배포 범위에서 제외 |
| 슬립 모드 완화 | UptimeRobot 등 무료 핑 서비스를 사용해 슬립 모드 완화를 검토할 수 있음. 단, Render 무료 플랜 정책 변경이나 제한 사항은 배포 시점에 다시 확인 |

포트폴리오 시연 전에는 사전 접속으로 첫 요청 지연을 줄일 수 있다. 필요하다면 UptimeRobot 같은 외부 핑 서비스를 검토할 수 있으나, 무료 플랜 정책과 허용 범위는 배포 시점에 확인해야 한다. 외부 핑 서비스는 선택 검토 사항이며 사용을 강제하지 않는다.

## 10. 배포 전 체크리스트

- [ ] `docs/phase1/local-runbook.md` 존재 여부 확인
- [ ] 존재하지 않는 문서를 전제로 배포 문서를 작성하지 않았는지 확인
- [ ] `frontend/phase1/package.json`에 `"start": "next start"` script 존재 여부 확인
- [ ] 백엔드 Render URL 확보
- [ ] 프론트엔드 `NEXT_PUBLIC_API_BASE_URL`에 백엔드 Render URL 설정
- [ ] 프론트엔드 Render URL 확보
- [ ] 백엔드 `ALLOWED_ORIGINS`에 프론트엔드 Render URL 설정
- [ ] 백엔드 환경변수 변경 후 재배포 또는 반영 확인
- [ ] 프론트엔드 추천 API 호출 확인
- [ ] 브라우저 콘솔에서 CORS 오류 없음 확인
- [ ] Render Free 티어 정책과 제한 사항을 배포 시점에 재확인

## 11. 완료 검증 기준

- [ ] `local-runbook.md` 존재 여부를 확인하고, 존재하지 않는 경우 문서에서 전제로 삼지 않았는지 확인
- [ ] `deployment-plan.md`에 권장 배포 순서가 포함되어 있는지 확인
- [ ] frontend `package.json` start script 확인 항목이 배포 전 체크리스트에 포함되어 있는지 확인
- [ ] CORS 설정 순서가 문서에 포함되어 있는지 확인
- [ ] Render Free 티어 슬립 모드 대응 기준이 Known Issues 또는 고려사항에 포함되어 있는지 확인

## 12. Known Issues

| 이슈 | 영향 | 대응 |
| --- | --- | --- |
| Render Free 티어 슬립 모드 | 비활성 상태 후 첫 요청이 느릴 수 있음 | 시연 전 사전 접속. 필요 시 UptimeRobot 등 핑 서비스 검토. 단, 무료 플랜 정책은 배포 시점에 확인 |
| 프론트엔드 start script 누락 가능성 | `package.json`에 `start` script가 없으면 Render Start Command 실패 가능 | 배포 전 `"start": "next start"` 존재 여부 확인 |
| CORS 설정 순서 | 백엔드 URL과 프론트엔드 URL이 서로 필요함 | 백엔드 선배포 → 프론트 배포 → 백엔드 `ALLOWED_ORIGINS` 업데이트 순서 권장 |
