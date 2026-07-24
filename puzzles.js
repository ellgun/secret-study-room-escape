/* ==========================================================================
   Puzzle Engine & State Management (puzzles.js)
   ========================================================================== */

class PuzzleManager {
  constructor(game) {
    this.game = game;

    // 퍼즐 1: 액자 정렬 상태
    this.frameAngles = {
      1: -15,
      2: 25,
      3: -30
    };
    this.framesSolved = false;

    // 퍼즐 2: 책 순서 상태
    this.bookTargetSequence = ['red', 'blue', 'green', 'yellow'];
    this.currentBookSequence = [];
    this.bookshelfSolved = false;

    // 퍼즐 3: 서랍 & UV 조합 상태
    this.drawer1Unlocked = false;
    this.uvLightTaken = false;

    // 퍼즐 4: 금고 암호 상태
    this.safeTargetCode = '7394';
    this.currentSafeCode = '';
    this.safeSolved = false;

    // 퍼즐 5: 문 해금
    this.doorUnlocked = false;
  }

  reset() {
    this.frameAngles = { 1: -15, 2: 25, 3: -30 };
    this.framesSolved = false;

    this.currentBookSequence = [];
    this.bookshelfSolved = false;

    this.drawer1Unlocked = false;
    this.uvLightTaken = false;

    this.currentSafeCode = '';
    this.safeSolved = false;

    this.doorUnlocked = false;
  }

  // ------------------------------------------------------------------------
  // 퍼즐 1: 액자 정렬 (Frames)
  // ------------------------------------------------------------------------
  rotateFrame(frameIndex) {
    if (this.framesSolved) return;
    window.soundEngine.playClick();
    
    // 15도씩 회전하며, -180 ~ 180범위 순환
    let angle = this.frameAngles[frameIndex] + 15;
    if (angle > 180) angle = -165;
    this.frameAngles[frameIndex] = angle;

    // UI 업데이트
    const frameEl = document.querySelector(`#interactive-frame-${frameIndex} .frame-box`);
    const statusEl = document.querySelector(`#interactive-frame-${frameIndex} .frame-status`);
    if (frameEl && statusEl) {
      frameEl.style.transform = `rotate(${angle}deg)`;
      if (angle === 0) {
        frameEl.classList.add('rotate-0');
        statusEl.innerText = '0° (올바름)';
        statusEl.style.color = '#10b981';
      } else {
        frameEl.classList.remove('rotate-0');
        statusEl.innerText = `${angle}° 기울어짐`;
        statusEl.style.color = '#aaa';
      }
    }
  }

  checkFrames() {
    if (this.framesSolved) {
      this.game.showMessage('이미 액자 퍼즐을 풀었습니다.');
      return;
    }

    if (this.frameAngles[1] === 0 && this.frameAngles[2] === 0 && this.frameAngles[3] === 0) {
      this.framesSolved = true;
      window.soundEngine.playSuccess();

      // 보상 아이템: 건전지 획득
      this.game.addItem({
        id: 'battery',
        name: '건전지',
        icon: '🔋',
        desc: '소형 알칼라인 AA 건전지입니다. 전자 장치에 전원을 공급할 수 있습니다.'
      });

      alert('🎉 액자가 바르게 정렬되면서 뒤에서 [건전지 🔋]를 발견하고 인벤토리에 추가했습니다!');
      this.game.closeModal();
    } else {
      window.soundEngine.playError();
      alert('❌ 액자 정렬이 바르지 않습니다. 모든 액자가 직각(0도)이 되도록 맞추세요!');
    }
  }

  // ------------------------------------------------------------------------
  // 퍼즐 2: 책장 책 순서 (Bookshelf)
  // ------------------------------------------------------------------------
  pressBook(color) {
    if (this.bookshelfSolved) return;
    window.soundEngine.playClick();

    this.currentBookSequence.push(color);
    
    // 입력 화면 업데이트
    const seqTextEl = document.getElementById('seq-text');
    const colorNames = { red: '빨강', blue: '파랑', green: '초록', yellow: '노랑', purple: '보라' };
    seqTextEl.innerText = this.currentBookSequence.map(c => colorNames[c] || c).join(' -> ');

    // 4개 입력 완료 시 체크
    if (this.currentBookSequence.length === this.bookTargetSequence.length) {
      const isCorrect = this.currentBookSequence.every((val, index) => val === this.bookTargetSequence[index]);
      if (isCorrect) {
        this.bookshelfSolved = true;
        window.soundEngine.playSuccess();

        // 보상 아이템: 작은 열쇠 획득
        this.game.addItem({
          id: 'small_key',
          name: '작은 열쇠',
          icon: '🗝️',
          desc: '정교하게 깎인 작은 황동 열쇠입니다. 서재 가구의 서랍을 열 수 있을 것 같습니다.'
        });

        alert('🎉 비밀 장치가 작동하며 책장 뒤에서 [작은 열쇠 🗝️]가 튀어나왔습니다!');
        this.game.closeModal();
      } else {
        window.soundEngine.playError();
        alert('❌ 책 순서가 잘못되어 비밀 장치가 초기화되었습니다.');
        this.resetBooks();
      }
    }
  }

  resetBooks() {
    this.currentBookSequence = [];
    const seqTextEl = document.getElementById('seq-text');
    if (seqTextEl) seqTextEl.innerText = '없음';
  }

  // ------------------------------------------------------------------------
  // 퍼즐 3: 책상 서랍 (Desk)
  // ------------------------------------------------------------------------
  unlockDrawer1() {
    if (this.drawer1Unlocked) return;

    if (this.game.hasItem('small_key')) {
      this.drawer1Unlocked = true;
      window.soundEngine.playUnlock();

      document.getElementById('btn-unlock-drawer1').classList.add('hidden');
      document.getElementById('drawer1-content').classList.remove('hidden');
    } else {
      window.soundEngine.playError();
      alert('🔒 열쇠가 없습니다! 서랍 1을 열 수 있는 열쇠를 찾아보세요.');
    }
  }

  takeUvLight() {
    if (this.uvLightTaken) return;
    this.uvLightTaken = true;
    window.soundEngine.playItemPick();

    this.game.addItem({
      id: 'uv_body',
      name: 'UV 라이트 본체',
      icon: '🔦',
      desc: '자외선(UV) 전구가 장착된 손전등 본체입니다. 작동시키려면 건전지가 필요합니다.'
    });

    document.getElementById('drawer1-content').innerHTML = '<p class="text-muted">서랍 안이 비어있습니다.</p>';
    alert('🎉 [UV 라이트 본체 🔦]를 인벤토리에 추가했습니다!');
  }

  // ------------------------------------------------------------------------
  // 퍼즐 4: 다이얼 금고 (Safe)
  // ------------------------------------------------------------------------
  pressSafeKey(key) {
    if (this.safeSolved) return;
    window.soundEngine.playClick();

    if (key === 'C') {
      this.currentSafeCode = '';
    } else if (key === 'OK') {
      this.checkSafeCode();
      return;
    } else {
      if (this.currentSafeCode.length < 4) {
        this.currentSafeCode += key;
      }
    }

    this.updateSafeDisplay();
  }

  updateSafeDisplay() {
    for (let i = 0; i < 4; i++) {
      const digitEl = document.getElementById(`digit-${i}`);
      if (digitEl) {
        digitEl.innerText = this.currentSafeCode[i] || '0';
      }
    }
  }

  checkSafeCode() {
    if (this.currentSafeCode === this.safeTargetCode) {
      this.safeSolved = true;
      window.soundEngine.playSuccess();

      // 보상 아이템: 마스터 키 획득 (3D 이미지 연동)
      this.game.addItem({
        id: 'master_key',
        name: '3D 마스터 키',
        icon: '🔑',
        image: 'master_key.jpg',
        desc: '묵직하고 화려하게 세공된 3D 앤틱 철제 마스터 키입니다. 서재의 최종 탈출 문을 열 수 있습니다.'
      });

      alert('🎉 찰칵! 금고가 열리며 [3D 마스터 키 🔑]를 발견했습니다!');
      this.game.closeModal();
    } else {
      window.soundEngine.playError();
      alert('❌ 금고 암호가 올바르지 않습니다.');
      this.currentSafeCode = '';
      this.updateSafeDisplay();
    }
  }

  // ------------------------------------------------------------------------
  // 퍼즐 5: 최종 문 해금 (Exit Door)
  // ------------------------------------------------------------------------
  unlockDoor() {
    if (this.game.hasItem('master_key')) {
      this.doorUnlocked = true;
      window.soundEngine.playSuccess();
      window.soundEngine.playUnlock();

      this.game.closeModal();
      this.game.triggerVictory();
    } else {
      window.soundEngine.playError();
      alert('🔒 마스터 키가 없습니다. 서재 안의 금고에서 마스터 키를 찾아야 합니다!');
    }
  }
}

window.PuzzleManager = PuzzleManager;
