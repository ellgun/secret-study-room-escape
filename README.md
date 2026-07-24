# 🗝️ 비밀의 서재 (The Secret Study) - 방탈출 웹 게임

어두컴컴한 앤틱 서재에 갇힌 당신! 숨겨진 단서를 찾고 자물쇠와 암호를 해제하여 서재를 탈출하세요!

## 🎮 게임 특징
- **중간 난이도 (Medium)**의 4단계 연계 퍼즐 트리
- **포인트 앤 클릭** 인터랙티브 SVG 앤틱 서재 그래픽
- **인벤토리 & 아이템 조합 시스템** (UV 라이트 + 건전지 = UV 손전등)
- **자외선(UV) 암호 시각화 연출**
- **Web Audio API** 기반 리얼타임 효과음 & 앰비언트 BGM
- **Vercel & GitHub 배포 최적화**

## 🧩 퍼즐 해법 흐름 (스포일러 주의)
1. **액자 정렬 퍼즐**: 벽의 액자 3개를 각각 클릭해 직각(0도)으로 정렬 ➔ `건전지 🔋` 획득
2. **책장 색상 퍼즐**: 책장 2단 책들을 무지개 순서(`빨강 -> 파랑 -> 초록 -> 노랑`)대로 누름 ➔ `작은 열쇠 🗝️` 획득
3. **서랍 및 아이템 조합**: `작은 열쇠`로 책상 서랍 1을 열어 `UV 라이트 본체 🔦` 획득 ➔ 인벤토리에서 `건전지` + `UV 라이트 본체` 선택 후 [아이템 조합] ➔ `작은 UV 손전등 🔦✨` 완성
4. **UV 암호 및 금고 해금**: `작은 UV 손전등`을 클릭하면 서재에 자외선 빛이 켜지고 책상 위에 야광 4자리 암호(`7394`)가 표시됨 ➔ 다이얼 금고에 `7394` 입력 ➔ `마스터 키 🔑` 획득
5. **최종 탈출**: `마스터 키`로 탈출 문을 열면 게임 클리어!

## 🚀 GitHub 및 Vercel 배포 방법

### 1) GitHub 저장소 생성 및 푸시
```bash
git init
git add .
git commit -m "Initial commit: Add Secret Study room escape game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/secret-study-room-escape.git
git push -u origin main
```

### 2) Vercel 배포
1. [Vercel](https://vercel.com) 로그인
2. **Add New...** ➔ **Project** 선택
3. GitHub 저장소 `secret-study-room-escape` 선택 및 Deploy 클릭
4. 배포 완료 후 바로 주소(URL)로 연결되어 어디서나 플레이 가능합니다!
