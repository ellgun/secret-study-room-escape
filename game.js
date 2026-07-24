/* ==========================================================================
   Game Main Controller (game.js)
   ========================================================================== */

class GameController {
  constructor() {
    this.inventory = [];
    this.selectedItemIndex = null;
    this.secondsElapsed = 0;
    this.timerInterval = null;
    this.puzzleManager = new PuzzleManager(this);
    this.uvActive = false;
  }

  init() {
    this.setupEventListeners();
    this.startTimer();
    this.renderInventory();
    window.soundEngine.startBgm();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.secondsElapsed = 0;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = String(Math.floor(this.secondsElapsed / 60)).padStart(2, '0');
    const secs = String(this.secondsElapsed % 60).padStart(2, '0');
    const timeTextEl = document.getElementById('time-text');
    if (timeTextEl) timeTextEl.innerText = `${mins}:${secs}`;
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ------------------------------------------------------------------------
  // 이벤트 리스너 설정
  // ------------------------------------------------------------------------
  setupEventListeners() {
    // 1. 헤더 버튼들
    document.getElementById('btn-sound').addEventListener('click', () => {
      const enabled = window.soundEngine.toggleSound();
      document.getElementById('btn-sound').innerText = enabled ? '🔊 소리 ON' : '🔇 소리 OFF';
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
      this.openHintModal();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      if (confirm('처음부터 다시 시작하시겠습니까? (진행 상황이 초기화됩니다)')) {
        location.reload();
      }
    });

    // 2. 3D 핫스팟 클릭 이벤트
    document.getElementById('hotspot-door').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openModal('modal-door');
    });

    document.getElementById('hotspot-clock').addEventListener('click', () => {
      window.soundEngine.playClick();
      alert('🕰️ 앤틱 괘종시계: 시계 바늘이 9시 15분을 가리키고 있습니다.');
    });

    document.getElementById('hotspot-frames').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openModal('modal-frames');
    });

    document.getElementById('hotspot-bookshelf').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openModal('modal-bookshelf');
    });

    document.getElementById('hotspot-desk').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openModal('modal-desk');
    });

    document.getElementById('hotspot-safe').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openModal('modal-safe');
    });

    // 3. 모달 닫기 버튼들
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // 배경 클릭 시 모달 닫기
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        this.closeModal();
      }
    });

    // 4. 퍼즐 연동 이벤트 핸들러
    // 액자 퍼즐
    [1, 2, 3].forEach(idx => {
      const frameEl = document.getElementById(`interactive-frame-${idx}`);
      if (frameEl) {
        frameEl.addEventListener('click', () => this.puzzleManager.rotateFrame(idx));
      }
    });
    document.getElementById('btn-check-frames').addEventListener('click', () => this.puzzleManager.checkFrames());

    // 책장 퍼즐
    document.querySelectorAll('.color-book').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        this.puzzleManager.pressBook(color);
      });
    });
    document.getElementById('btn-reset-books').addEventListener('click', () => this.puzzleManager.resetBooks());

    // 책상 서랍
    document.getElementById('btn-unlock-drawer1').addEventListener('click', () => this.puzzleManager.unlockDrawer1());
    document.getElementById('btn-take-uvlight').addEventListener('click', () => this.puzzleManager.takeUvLight());

    // 금고 키패드
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.getAttribute('data-key');
        this.puzzleManager.pressSafeKey(key);
      });
    });

    // 최종 문 열기
    document.getElementById('btn-use-masterkey').addEventListener('click', () => this.puzzleManager.unlockDoor());

    // 인벤토리 액션 버튼
    document.getElementById('btn-inspect').addEventListener('click', () => this.inspectSelectedItem());
    document.getElementById('btn-combine').addEventListener('click', () => this.combineSelectedItem());

    // 재도전 버튼
    document.getElementById('btn-play-again').addEventListener('click', () => location.reload());
  }

  // ------------------------------------------------------------------------
  // 모달 제어
  // ------------------------------------------------------------------------
  openModal(modalId) {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');

    document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));

    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      targetModal.classList.remove('hidden');
    }
  }

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));
  }

  // ------------------------------------------------------------------------
  // 인벤토리 관리
  // ------------------------------------------------------------------------
  addItem(item) {
    if (this.inventory.length >= 8) {
      alert('인벤토리가 가득 찼습니다.');
      return false;
    }
    this.inventory.push(item);
    this.renderInventory();
    return true;
  }

  hasItem(itemId) {
    return this.inventory.some(i => i.id === itemId);
  }

  removeItem(itemId) {
    this.inventory = this.inventory.filter(i => i.id !== itemId);
    this.selectedItemIndex = null;
    this.renderInventory();
  }

  renderInventory() {
    const slotsContainer = document.getElementById('inventory-slots');
    const slots = slotsContainer.querySelectorAll('.slot');

    slots.forEach((slot, index) => {
      const item = this.inventory[index];
      slot.innerHTML = '';
      slot.className = 'slot';

      if (index === this.selectedItemIndex) {
        slot.classList.add('selected');
      }

      if (item) {
        if (item.image) {
          slot.innerHTML = `
            <img class="slot-3d-img" src="${item.image}" alt="${item.name}">
            <span class="slot-item-name">${item.name}</span>
          `;
        } else {
          slot.innerHTML = `
            <span>${item.icon}</span>
            <span class="slot-item-name">${item.name}</span>
          `;
        }
        slot.onclick = () => this.selectSlot(index);
      } else {
        slot.onclick = () => this.selectSlot(null);
      }
    });

    // 상세보기/조합 버튼 활성화 상태 업데이트
    const inspectBtn = document.getElementById('btn-inspect');
    const combineBtn = document.getElementById('btn-combine');

    if (this.selectedItemIndex !== null && this.inventory[this.selectedItemIndex]) {
      inspectBtn.disabled = false;
      combineBtn.disabled = false;
    } else {
      inspectBtn.disabled = true;
      combineBtn.disabled = true;
    }
  }

  selectSlot(index) {
    window.soundEngine.playClick();
    if (this.selectedItemIndex === index) {
      this.selectedItemIndex = null;
    } else {
      this.selectedItemIndex = index;
    }
    this.renderInventory();

    // 선택된 아이템이 UV 손전등인지 확인
    const selectedItem = this.inventory[this.selectedItemIndex];
    if (selectedItem && selectedItem.id === 'uv_flashlight') {
      this.toggleUvLight(true);
    } else {
      this.toggleUvLight(false);
    }
  }

  toggleUvLight(active) {
    this.uvActive = active;
    const uvOverlay = document.getElementById('uv-overlay');
    const uvText = document.getElementById('uv-secret-text');

    if (active) {
      uvOverlay.style.opacity = '0.85';
      uvText.style.opacity = '1';
    } else {
      uvOverlay.style.opacity = '0';
      uvText.style.opacity = '0';
    }
  }

  inspectSelectedItem() {
    if (this.selectedItemIndex === null) return;
    const item = this.inventory[this.selectedItemIndex];
    if (!item) return;

    window.soundEngine.playClick();
    document.getElementById('inspect-title').innerText = item.name;

    const iconContainer = document.getElementById('inspect-icon');
    if (item.image) {
      iconContainer.innerHTML = `<img class="inspect-3d-img" src="${item.image}" alt="${item.name}">`;
    } else {
      iconContainer.innerText = item.icon;
    }

    document.getElementById('inspect-description').innerText = item.desc;

    this.openModal('modal-item-detail');
  }

  combineSelectedItem() {
    if (this.selectedItemIndex === null) return;
    const item = this.inventory[this.selectedItemIndex];

    if (item.id === 'battery' || item.id === 'uv_body') {
      if (this.hasItem('battery') && this.hasItem('uv_body')) {
        this.removeItem('battery');
        this.removeItem('uv_body');

        window.soundEngine.playSuccess();
        this.addItem({
          id: 'uv_flashlight',
          name: '3D UV 손전등',
          icon: '🔦✨',
          image: 'uv_flashlight.jpg',
          desc: '건전지가 장착되어 자외선(UV) 빛을 발산하는 3D 손전등입니다. 인벤토리에서 이 손전등을 클릭하여 선택하면 서재 안의 3D 야광 암호를 비출 수 있습니다!'
        });

        alert('⚡ [건전지 🔋]와 [UV 라이트 본체 🔦]를 조합하여 [3D UV 손전등 🔦✨]을 완성했습니다!');
      } else {
        window.soundEngine.playError();
        alert('💡 이 아이템을 조합하려면 [건전지]와 [UV 라이트 본체]가 모두 필요합니다.');
      }
    } else {
      window.soundEngine.playError();
      alert('조합할 수 없는 아이템입니다.');
    }
  }

  // ------------------------------------------------------------------------
  // 힌트 시스템
  // ------------------------------------------------------------------------
  openHintModal() {
    window.soundEngine.playClick();
    const hintList = document.getElementById('hint-list');
    hintList.innerHTML = '';

    const hints = [];

    if (!this.puzzleManager.framesSolved) {
      hints.push('🖼️ 액자 퍼즐: 달(🌙) -> 태양(☀️) -> 별(⭐) 순서로 클릭하여 0도(직각)로 맞추세요.');
    } else if (!this.hasItem('battery') && !this.hasItem('uv_flashlight')) {
      hints.push('🔋 액자 퍼즐을 완성하면 건전지를 얻을 수 있습니다.');
    }

    if (!this.puzzleManager.bookshelfSolved) {
      hints.push('📚 책장 퍼즐: 책장 2단에서 무지개 색상 순서대로 (빨강 -> 파랑 -> 초록 -> 노랑) 책을 누르세요.');
    } else if (!this.puzzleManager.drawer1Unlocked) {
      hints.push('🗝️ 책장 퍼즐에서 얻은 작은 열쇠로 책상 서랍 1을 열어보세요.');
    }

    if (this.hasItem('battery') && this.hasItem('uv_body')) {
      hints.push('⚡ 인벤토리에서 건전지나 UV 라이트 본체를 선택한 후 [아이템 조합] 버튼을 누르세요.');
    }

    if (this.hasItem('uv_flashlight') && !this.puzzleManager.safeSolved) {
      hints.push('🔦✨ 인벤토리에서 [3D UV 손전등]을 클릭하여 선택하면 3D 서재에 4자리 야광 암호(7394)가 나타납니다!');
      hints.push('🔐 다이얼 금고에 7394를 입력하면 3D 마스터 키를 얻을 수 있습니다.');
    }

    if (this.hasItem('master_key')) {
      hints.push('🔑 획득한 마스터 키를 이용해 탈출 문의 자물쇠를 열고 탈출하세요!');
    }

    if (hints.length === 0) {
      hints.push('서재 안의 모든 힌트와 장치들을 자유롭게 탐색해보세요!');
    }

    hints.forEach(hint => {
      const li = document.createElement('li');
      li.className = 'hint-item';
      li.innerText = hint;
      hintList.appendChild(li);
    });

    this.openModal('modal-hint');
  }

  // ------------------------------------------------------------------------
  // 탈출 성공
  // ------------------------------------------------------------------------
  triggerVictory() {
    this.stopTimer();

    const mins = String(Math.floor(this.secondsElapsed / 60)).padStart(2, '0');
    const secs = String(this.secondsElapsed % 60).padStart(2, '0');
    const timeStr = `${mins}분 ${secs}초`;

    document.getElementById('final-time').innerText = timeStr;

    let rank = '전설의 탈출가';
    if (this.secondsElapsed < 120) {
      rank = '⚡ 초스피드 탈출 마스터';
    } else if (this.secondsElapsed < 300) {
      rank = '🔍 명탐정 이스케이프';
    } else {
      rank = '🗝️ 집념의 서재 탐험가';
    }
    document.getElementById('final-rank').innerText = rank;

    this.openModal('modal-clear');
  }
}

// 게임 시작
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameController();
  window.game.init();
});
