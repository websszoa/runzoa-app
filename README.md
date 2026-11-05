# runzoa-app

마라톤 대회의 개최 일정과 접수 상태를 확인하는 Apps in Toss 웹 앱입니다.

## 실행

```bash
npm install
npm run dev
```

프로덕션 빌드와 코드 검사는 다음 명령으로 실행합니다.

```bash
npm run lint
npm run test
npm run build
```

## 데이터

대회 데이터는 `src/api/marathons.ts`에서 아래 JSON API를 합쳐 불러옵니다.

```text
https://websszoa.github.io/runzoa.com/data/marathons/marathons_2026.json
https://websszoa.github.io/runzoa.com/data/marathons/marathons_2027.json
```

- 지난 대회는 API 변환 단계에서 제외합니다.
- 원본 JSON은 브라우저 `localStorage`에 저장하며 로컬 날짜 기준 하루에 한 번만 갱신합니다.
- 같은 세션의 중복 요청은 메모리 캐시와 진행 중 요청 공유로 방지합니다.
- 한 연도의 요청이 실패해도 다른 연도의 정상 데이터는 계속 표시합니다.
- 외부 JSON은 필요한 필드를 검증하고 누락된 선택 필드에는 안전한 기본값을 적용합니다.
- 접수 상태 계산은 `src/lib/utils.ts`의 `getRaceStatus`가 담당합니다.
- API 데이터를 화면용 형식으로 변환하면서 상세 팝업에 필요한 정보도 함께 저장합니다.

## 대회 상세 Dialog

메인 또는 대회 목록에서 항목을 클릭하면 shadcn의 `Dialog`를 사용한 상세 팝업이 열립니다.

- 공통 상세 UI: `src/components/race-dialog.tsx`
- shadcn Dialog 원본 컴포넌트: `src/components/ui/dialog.tsx`
- 클릭 가능한 목록 카드: `src/components/list-style.tsx`

Dialog에는 유형, 한글 형식의 대회·접수 기간, 장소, 종목별 참가비와 접수·공식 사이트 링크가 표시됩니다. 주소 아래에서는 주소 복사, 네이버지도 검색, 카카오맵 검색을 이용할 수 있습니다. 키보드 사용자는 목록 항목에서 `Enter` 또는 `Space`로 팝업을 열고 `Esc`로 닫을 수 있습니다.

shadcn 컴포넌트를 추가할 때는 프로젝트 루트에서 다음 형식을 사용합니다.

```bash
npx shadcn add <component-name>
```
