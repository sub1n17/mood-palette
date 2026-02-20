// 화면 렌더용 배열
let currentList = [];

// 페이지가 처음 열릴 때 자동 실행
window.onload = () => {
    window.addEventListener('scroll', () => {
        const windowScroll = window.scrollY;

        const feelScroll = document.getElementById('feelScroll');
        const picChk = document.querySelector('.pic_chk');

        if (windowScroll > 0) {
            feelScroll.classList.add('scrolled');
            picChk.classList.add('scrolled');
        } else {
            feelScroll.classList.remove('scrolled');
            picChk.classList.remove('scrolled');
        }
    });

    document.getElementById('goTop').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const put_diaryList = localStorage.getItem('diaryList') ?? '[]';
    currentList = JSON.parse(put_diaryList);

    // 검색
    const params = new URLSearchParams(location.search);
    const keyword = params.get('search') || '';
    const feel = params.get('feel') || 'all';

    document.getElementById('searchInput').value = keyword;

    const feelInput = document.querySelector(`input[name="filterFeel"][value="${feel}"]`);
    if (feelInput) {
        feelInput.checked = true;
        changeFeelTxt(feelInput.value, false); // 페이지 첫 진입 시 isAction=false
    }

    // 기분 선택
    document.querySelectorAll('input[name="filterFeel"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
            const searchTxt = document.getElementById('searchInput').value.trim();
            changeFeelTxt(e.target.value); // 기분 선택 시 isAction 기본값 true
            filterList(searchTxt, e.target.value);
        });
    });

    // 초기 필터 실행
    if (keyword || feel !== 'all') {
        filterList(keyword, feel);
    } else {
        makePage(startPage);
        diaryPage(startPage);
    }
};

const add = () => {
    // 선택한 기분 가져오기
    let writeFeel;
    document.getElementsByName('writeFeel').forEach((el) => {
        if (el.checked) {
            writeFeel = el.value;
        }
    });

    // 입력한 제목, 내용 가져오기
    const writeTitle = document.getElementById('title').value;
    const writeContent = document.getElementById('content').value;

    // 일기 등록한 날짜 가져오기
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = today.getDate();
    const writeDate = `${year}-${month}-${date}`;

    const feelError = document.getElementById('feelError');
    const titleError = document.getElementById('titleError');
    const contentError = document.getElementById('contentError');

    let isValid = true;
    if (!writeFeel) {
        feelError.innerText = '기분을 선택해주세요.';
        isValid = false;
    } else {
        feelError.innerText = '';
    }

    if (!writeTitle.trim()) {
        titleError.innerText = '제목을 입력해주세요.';
        isValid = false;
    } else {
        titleError.innerText = '';
    }

    if (!writeContent.trim()) {
        contentError.innerText = '내용을 입력해주세요.';
        isValid = false;
    } else {
        contentError.innerText = '';
    }

    if (!isValid) return; // 3개 항목 모두 없으면 실행 중단

    // 기분, 제목, 내용, 날짜를 객체로 저장하기
    const writeDiary = {
        id: Date.now(), // 게시글마다 고유 id 부여하기
        diaryFeel: writeFeel,
        diaryTitle: writeTitle,
        diaryContent: writeContent,
        diaryDate: writeDate,
    };

    const put_diaryList = localStorage.getItem('diaryList');
    const arr_diaryList = put_diaryList === null ? '[]' : put_diaryList;
    const diaryList = JSON.parse(arr_diaryList);

    diaryList.push(writeDiary);

    localStorage.setItem('diaryList', JSON.stringify(diaryList));

    currentList = diaryList;

    document.getElementsByName('writeFeel').forEach((el) => {
        el.checked = false;
    });
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';

    // 등록 모달 닫기
    document.getElementById('modal_wrapper').style.display = 'none';
    document.body.classList.remove('no-scroll');

    // 토스트 표시
    showToast('등록되었습니다');

    lastPage = Math.ceil(diaryList.length / 12);
    startPage = lastPage; // 현재 보고 있는 페이지를 최신으로 맞춤

    diaryPage(lastPage); // 마지막 페이지 보여주기
    makePage(lastPage);
};

// 등록 모달 초기화
const resetWriteForm = () => {
    // 라디오 버튼 초기화
    document.querySelectorAll('input[name="writeFeel"]').forEach((radio) => {
        radio.checked = false;
    });

    // 텍스트 입력 초기화
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';

    // 에러 메시지 초기화
    document.getElementById('feelError').textContent = '';
    document.getElementById('titleError').textContent = '';
    document.getElementById('contentError').textContent = '';
};

// 전체 데이터 로딩
const showDiary = () => {
    const put_diaryList = localStorage.getItem('diaryList') ?? '[]';
    currentList = JSON.parse(put_diaryList);

    lastPage = Math.ceil(currentList.length / 12);
    startPage = 1;

    diaryPage(1);
    makePage(1);
};

const deleteDiary = (id) => {
    const put_diaryList = localStorage.getItem('diaryList') ?? '[]';
    const diaryList = JSON.parse(put_diaryList);

    const noDelete = diaryList.filter((el) => el.id !== id);

    localStorage.setItem('diaryList', JSON.stringify(noDelete));

    currentList = noDelete;

    // 삭제 후 총 페이지 수 계산
    lastPage = Math.ceil(currentList.length / 12);

    // 재 페이지가 마지막 페이지보다 클 때 (마지막 페이지에서 마지막 글 삭제했을 때) 마지막 페이지로 이동
    if (startPage > lastPage) {
        // 글이 하나도 없으면 1페이지 유지
        startPage = lastPage || 1;
    }

    diaryPage(startPage);
    makePage(startPage);
};

// 우측 여백 동일하게 만들기 (relative로 하면 right 적용 안 되니까 탑버튼의 부모를 만들어서 기준점 주고 absolute로 찍기)
window.addEventListener('scroll', function () {
    // 현재 화면 높이
    const innerHeight = window.innerHeight;
    // footer의 현재 화면 기준 위치 (위에서 얼마나 떨어져 있는지)
    const fromFooter = document.getElementById('footer').getBoundingClientRect().top;

    // 화면 높이보다 footer 위치가 더 작거나 같을 때, footer가 화면 안에 들어온 상태일 때
    if (innerHeight >= fromFooter) {
        document.getElementById('goTop').style = 'position:absolute; bottom:23rem; right:4rem;';
    } else {
        document.getElementById('goTop').style = 'position:fixed; bottom:4rem; right:4rem;';
    }
});

// 일기등록 모달창 띄우기 + 스크롤 막기 + 스크롤 맨 뒤로 이동하기
const modalAdd = () => {
    document.getElementById('modal_wrapper').style.display = 'block';
    document.body.classList.add('no-scroll');
    window.scrollTo({ top: 0 });
};

// ESC 키 눌렀을 때 모달 닫기 + 스크롤 가능 (keydown:키를 누르는 순간)
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.getElementById('modal_wrapper').style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
});

// 등록취소 모달창 띄우기
const openCancelModal = () => {
    openModal('일기 등록 취소', '일기 등록을 취소하시겠어요?', [
        {
            text: '계속 작성',
            className: 'close_btn',
            onClick: closeModal,
        },
        {
            text: '등록 취소',
            className: 'go_btn',
            onClick: () => {
                closeModal();
                resetWriteForm();
            },
        },
    ]);
};

// 공통 모달 열기
const openModal = (title, message, buttons) => {
    const modal = document.getElementById('commonModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalButtons = document.getElementById('modalButtons');

    modalTitle.innerText = title;
    modalMessage.innerText = message;
    // 버튼 초기화
    modalButtons.innerHTML = '';

    buttons.forEach((btn) => {
        const button = document.createElement('button');
        button.innerText = btn.text;
        button.className = btn.className;
        button.onclick = btn.onClick;
        modalButtons.appendChild(button);
    });

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
};

// 공통 모달 닫기
const closeModal = () => {
    document.getElementById('commonModal').style.display = 'none';
    document.getElementById('modal_wrapper').style.display = 'none';

    document.body.classList.remove('no-scroll');
};

// 일기등록 모달창 배경 클릭 시, 모달창 없애기
const background = () => {
    document.getElementById('modal_wrapper').style.display = 'none';
    document.body.classList.remove('no-scroll');

    // 모달 닫으면 에러메시지 없애기
    resetWriteForm();
};

// 삭제 확인 모달
const openDeleteConfirmModal = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    openModal('일기 삭제', '삭제하시겠습니까?', [
        {
            text: '취소',
            className: 'close_btn',
            onClick: closeModal,
        },
        {
            text: '삭제',
            className: 'go_btn',
            onClick: () => {
                deleteDiary(id);
                closeModal();
                showToast('삭제되었습니다');
            },
        },
    ]);
};

// 삭제 완료 토스트
const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 1000);
};

// 네비 메뉴
const nav = (diaryORpic) => {
    // 일기보관함 클릭
    if (diaryORpic === 'diary') {
        document.getElementById('diaryWrapper').style.display = 'block';
        document.getElementById('picWrapper').style.display = 'none';

        document.querySelector('.select_wrapper').style.display = 'flex';
        document.getElementById('picSelect').style.display = 'none';

        // nav li.on 변경
        document.getElementById('menuPic').classList.remove('on');
        document.getElementById('menuDiary').classList.add('on');

        // 사진보관함 클릭
    } else if (diaryORpic === 'pic') {
        document.getElementById('picWrapper').style.display = 'grid';
        document.getElementById('diaryWrapper').style.display = 'none';

        // fetch API로 강아지 이미지 불러오기 (https://dog.ceo/dog-api/) + 스켈레톤 효과넣기
        fetch('https://dog.ceo/api/breeds/image/random/10').then((result) => {
            result.json().then((object) => {
                const picList = object.message;
                const picAll = picList
                    .map((el) => {
                        return `
                        <div class='skeleton_wrapper'>
                            <div class='skeleton_bg'></div>
                            <div class='skeleton'></div>
                            <img src="${el}" id='picDog'>
                        </div>
                    `;
                    })
                    .join('');
                document.getElementById('picWrapper').innerHTML = picAll;

                // 0.7초 뒤 스켈레톤 효과 제거
                setTimeout(() => {
                    document.querySelectorAll('.skeleton_bg, .skeleton').forEach((el) => {
                        el.style.display = 'none';
                    });
                }, 700);
            });
        });

        // 70% 이상 스크롤했을 때 랜덤이미지 10개 추가 + 스로틀링
        let scrolling = false;
        window.addEventListener('scroll', () => {
            // 이미 fetch 중이면 실행 중단 (스크롤하는 동안 수십 번 실행되는 현상 막기)
            if (scrolling) return;

            // 현재 위에서부터 얼마나 내려왔는지 / 전체 문서 높이 (보이지 않는 부분 포함) - 현재 화면에 보이는 높이 (브라우저 창 높이)
            // 현재 내려온 거리 / 전체 내려갈 수 있는 거리
            const scrollPercent =
                document.documentElement.scrollTop /
                (document.documentElement.scrollHeight - document.documentElement.clientHeight);

            if (!(scrollPercent >= 0.7)) return;

            scrolling = true; // 이제 fetch 중이니까 true로 바꿔둠

            fetch('https://dog.ceo/api/breeds/image/random/10').then((result) => {
                result.json().then((object) => {
                    const picList = object.message;
                    const newPic = picList
                        .map((el) => {
                            return `
                        <div class='skeleton_wrapper'>
                            <div class='skeleton_bg'></div>
                            <div class='skeleton'></div>
                            <img src="${el}" id='picDog'>
                        </div>
                    `;
                        })
                        .join('');

                    // 기존 fetch된 것과 합치기
                    document.getElementById('picWrapper').innerHTML += newPic;

                    // fetch 완료 후에만 skeleton 제거
                    setTimeout(() => {
                        document.querySelectorAll('.skeleton_bg, .skeleton').forEach((el) => {
                            el.style.display = 'none';
                        });

                        scrolling = false; // 다시 false로 돌려놓음 → 다음 스크롤 허용
                    }, 700);
                });
            });
        });

        // nav li.on 변경
        document.getElementById('menuPic').classList.add('on');
        document.getElementById('menuDiary').classList.remove('on');

        // pic_select 나타내기
        document.getElementById('picSelect').style.display = 'block';
        document.querySelector('.select_wrapper').style.display = 'none';
    }
};

// 사진보관함 select 클릭 시 사진 비율 변경
const ratio = (event) => {
    const aspectRatio = event.target.id;
    const wrappers = document.querySelectorAll('.skeleton_wrapper');
    // 사진비율 변경하기
    switch (aspectRatio) {
        case 'normal':
            wrappers.forEach((el) => {
                el.style.aspectRatio = '1/1';
            });
            break;

        case 'horizontal':
            wrappers.forEach((el) => {
                el.style.aspectRatio = '4/3';
            });
            break;

        case 'vertical':
            wrappers.forEach((el) => {
                el.style.aspectRatio = '3/4';
            });
            break;
    }

    // 텍스트 변경하기
    const ratioTxt = event.target.value;
    document.querySelector('.pic_chk').style = `--aspect-ratio:"${ratioTxt}"`;
    document.querySelector('.pic_chk').click(); // input 닫기
};

// 기분 필터링 + 검색 함수
const filterList = (keyword, feelValue) => {
    const put_diaryList = localStorage.getItem('diaryList');
    const arr_diaryList = put_diaryList === null ? '[]' : put_diaryList;
    const diaryList = JSON.parse(arr_diaryList);

    let filterList = diaryList;

    const searchTxt = keyword || document.getElementById('searchInput').value.trim();

    const newParams = new URLSearchParams();
    if (searchTxt) newParams.set('search', searchTxt);
    if (feelValue !== 'all') newParams.set('feel', feelValue);

    // url에 검색어와 기분 반영하기
    history.replaceState(null, '', '?' + newParams.toString());

    // 기분 필터
    if (feelValue !== 'all') {
        filterList = filterList.filter((el) => el.diaryFeel === feelValue);
    }
    // 검색 필터
    if (searchTxt !== '') {
        filterList = filterList.filter((el) => el.diaryTitle.includes(searchTxt));
    }

    currentList = filterList;

    lastPage = Math.ceil(currentList.length / 12);
    startPage = 1;

    diaryPage(1);
    makePage(1);
};

// 기분 select check => ul 뜨게하기
const changeFeelTxt = (value, isAction = true) => {
    const feelTxt = value;

    // 기분을 클릭했을 때 '.input_chk'가 클릭되게 해서 선택창을 닫아줌
    if (isAction) {
        document.querySelector('.input_chk').click();
    }

    switch (feelTxt) {
        case 'all': {
            document.querySelector('.input_chk').style = `--기분필터링: '전체'`;
            break;
        }
        case 'happy': {
            document.querySelector('.input_chk').style = `--기분필터링: '행복해요'`;
            break;
        }
        case 'sad': {
            document.querySelector('.input_chk').style = `--기분필터링: '슬퍼요'`;
            break;
        }
        case 'sur': {
            document.querySelector('.input_chk').style = `--기분필터링: '놀라워요'`;
            break;
        }
        case 'ang': {
            document.querySelector('.input_chk').style = `--기분필터링: '화나요'`;
            break;
        }
        case 'etc': {
            document.querySelector('.input_chk').style = `--기분필터링: '기타'`;
            break;
        }
    }
};

// // 일기등록 다크모드
// const dark = () => {
//     document.body.classList.toggle('dark');
// };

// 일기 검색
let searchStop;
const search = (event) => {
    clearTimeout(searchStop);

    searchStop = setTimeout(() => {
        const keyword = event.target.value.trim();
        const checkedFeel =
            document.querySelector('input[name="filterFeel"]:checked')?.value || 'all';

        const params = new URLSearchParams();

        if (keyword) {
            params.set('search', keyword);
        }

        if (checkedFeel !== 'all') {
            params.set('feel', checkedFeel);
        }

        location.href = `./index.html?${params.toString()}`;
    }, 500);
};

// 일기 배열 가져오기
const put_diaryList = localStorage.getItem('diaryList');
const arr_diaryList = put_diaryList === null ? '[]' : put_diaryList;
const diaryList = JSON.parse(arr_diaryList);

currentList = diaryList;

let startPage = 1;
let lastPage = Math.ceil(diaryList.length / 12); // 한 페이지에 12개 일기만 보이게 하기

// 페이지네이션 - 페이지번호 만들기
const makePage = (clickPage) => {
    lastPage = Math.ceil(currentList.length / 12);

    const currentGroup = Math.ceil(clickPage / 5);
    startPage = (currentGroup - 1) * 5 + 1;
    const endPage = Math.min(startPage + 5 - 1, lastPage);

    const page = new Array(5).fill('page');

    const pageNum = page
        .map((el, index) => {
            return index + startPage <= lastPage
                ? `<button 
                onclick="diaryPage(${index + startPage}); makePage(${index + startPage})"
                class="${clickPage === index + startPage ? 'active' : ''}"
                style="cursor: pointer;"
                >
                ${index + startPage}
                </button>`
                : '';
        })
        .join('');

    document.getElementById('pagination').innerHTML = pageNum;

    // 왼쪽, 오른쪽 버튼 활성화시키기
    const leftArr = document.querySelector('.page_l');
    const rightArr = document.querySelector('.page_r');

    // 왼쪽 화살표: 시작 페이지가 1보다 크면 활성화
    if (startPage > 1) {
        leftArr.style.filter = 'invert(0)';
    } else {
        leftArr.style.filter = 'invert(1)';
    }

    // 오른쪽 화살표: 마지막 페이지 그룹보다 작으면 활성화
    if (endPage < lastPage) {
        rightArr.style.filter = 'invert(0)';
    } else {
        rightArr.style.filter = 'invert(1)';
    }
};

// 일기 페이지 : 페이지 렌더링
const diaryPage = (clickPage) => {
    const diaryList = currentList;
    // 1. 데이터가 하나도 없을 때 (로컬스토리지가 비었거나 검색 결과가 없을 때)
    if (diaryList.length === 0) {
        document.getElementById('diary_list').innerHTML = `
            <div class="no_data">
                <p>등록된 일기가 없습니다.</p>
            </div>
        `;
        document.querySelector('.page_wrapper').style.display = 'none';
        return;
    }

    // 2. 데이터가 있을 때
    document.querySelector('.page_wrapper').style.display = 'flex';
    const startDiaryIndex = (clickPage - 1) * 12;
    const filterPage = diaryList.filter((el, index) => {
        return startDiaryIndex <= index && index < startDiaryIndex + 12;
    });

    const params = new URLSearchParams(location.search);
    const searchTxt = params.get('search') || '';
    const feel = params.get('feel') || '';

    document.getElementById('diary_list').innerHTML = filterPage
        .map((el, index) => {
            return `
        <a href="./detail.html?id=${el.id}${searchTxt ? `&search=${encodeURIComponent(searchTxt)}` : ''}${feel ? `&feel=${feel}` : ''}" class="diaryCard">
            <div class="diary_card">
                <div class="img_wrapper">
                    <div class="diary_img">
                        ${el.diaryFeel === 'happy' ? '<img src="./images/emoji_happy.png">' : ''}
                        ${el.diaryFeel === 'sad' ? '<img src="./images/emoji_sad.png">' : ''}
                        ${el.diaryFeel === 'sur' ? '<img src="./images/emoji_surprised.png">' : ''}
                        ${el.diaryFeel === 'ang' ? '<img src="./images/emoji_angry.png">' : ''}
                        ${el.diaryFeel === 'etc' ? '<img src="./images/emoji_etc.png">' : ''}
                    </div>
                    <img src ="./images/deleteButton.png" class="delete" 
                        onclick="openDeleteConfirmModal(event, ${el.id})"
                    >
                </div>
                <div class="diary_flex">
                    <div>
                        ${el.diaryFeel === 'happy' ? '<p class="happy">행복해요</p>' : ''}
                        ${el.diaryFeel === 'sad' ? '<p class="sad">슬퍼요</p>' : ''}
                        ${el.diaryFeel === 'sur' ? '<p class="sur">놀라워요</p>' : ''}
                        ${el.diaryFeel === 'ang' ? '<p class="ang">화나요</p>' : ''}
                        ${el.diaryFeel === 'etc' ? '<p class="etc">기타</p>' : ''}
                        <p class="diaryTitle">${el.diaryTitle}</p>
                    </div>
                    <p class="diaryDate">${el.diaryDate}</p>
                </div>
            </div>
        </a>

        `;
        })
        .join('');
};

const prev = () => {
    if (startPage - 5 > 0) {
        startPage = startPage - 5;
        makePage(startPage);
        diaryPage(startPage);
    }
};

const next = () => {
    if (startPage + 5 <= lastPage) {
        startPage = startPage + 5;
        makePage(startPage);
        diaryPage(startPage);
    }
};
