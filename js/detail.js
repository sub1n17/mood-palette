let diaryList = [];

window.onload = () => {
    const query = location.search;
    const url = new URLSearchParams(query);
    const diaryId = Number(url.get('id'));

    diaryList = JSON.parse(localStorage.getItem('diaryList') ?? '[]');

    const diary = diaryList.find((el) => el.id === diaryId);

    if (!diary) {
        location.replace('./index.html');
        return;
    }

    document.getElementById('title').innerText = diary.diaryTitle;
    document.getElementById('content').innerText = diary.diaryContent;
    document.getElementById('date').innerText = diary.diaryDate;

    const diaryFeeling = diary.diaryFeel;
    if (diaryFeeling === 'happy') {
        document.getElementById('feelImg').src = './images/detail_happy.png';
        document.getElementById('feelTxt').innerText = '행복해요';
        document.getElementById('feelTxt').style.color = '#ea5757';
    } else if (diaryFeeling === 'sad') {
        document.getElementById('feelImg').src = './images/detail_sad.png';
        document.getElementById('feelTxt').innerText = '슬퍼요';
        document.getElementById('feelTxt').style.color = '#28b4e1';
    } else if (diaryFeeling === 'sur') {
        document.getElementById('feelImg').src = './images/detail_sur.png';
        document.getElementById('feelTxt').innerText = '놀라워요';
        document.getElementById('feelTxt').style.color = '#d59029';
    } else if (diaryFeeling === 'ang') {
        document.getElementById('feelImg').src = './images/detail_ang.png';
        document.getElementById('feelTxt').innerText = '화나요';
        document.getElementById('feelTxt').style.color = '#777777';
    } else if (diaryFeeling === 'etc') {
        document.getElementById('feelImg').src = './images/detail_etc.png';
        document.getElementById('feelTxt').innerText = '기타';
        document.getElementById('feelTxt').style.color = '#a229ed';
    }

    showComment();
};

// 수정 후 뒤로가기로 상세페이지 렌더링할 때 이전 데이터를 메모리에서 복원하지 않게 하기
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        location.reload(); // 캐시에서 페이지를 복원했다면 강제 새로고침
    }
});

const edit = () => {
    const query = location.search;
    const url = new URLSearchParams(query);
    const diaryId = url.get('id');

    location.href = `./edit.html?id=${diaryId}`;
};

const leave = () => {
    // 1. 주소에서 일기번호 가져오기
    const query = location.search;
    const url = new URLSearchParams(query);
    const diaryId = Number(url.get('id'));

    // 2. 스토리지에 저장된 일기목록 가져오기
    const diary = diaryList.find((el) => el.id === diaryId);

    if (!diary) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = today.getDate();
    const leaveDate = `${year}-${month}-${date}`;

    // 3. 작성된 회고내용 통에 담기
    const leaveComment = document.getElementById('commentInput').value;

    diary.commentList = diary.commentList ?? [];

    const writeComment = {
        commentTxt: leaveComment,
        commentDate: leaveDate,
    };

    diary.commentList.push(writeComment);

    localStorage.setItem('diaryList', JSON.stringify(diaryList));

    document.getElementById('commentInput').value = '';

    showComment();
};

const showComment = () => {
    const query = location.search;
    const url = new URLSearchParams(query);
    const diaryId = Number(url.get('id'));

    const diary = diaryList.find((el) => el.id === diaryId);

    if (!diary) return;

    diary.commentList = diary.commentList ?? [];

    const commentAll = diary.commentList
        .map((el) => {
            return `
            <div class="comment">
                <p class="cmt">${el.commentTxt}</p>
                <p class="date">[${el.commentDate}]</p>
            </div>
        `;
        })
        .join('');
    document.getElementById('listWrapper').innerHTML = commentAll;
};

// 삭제 버튼 눌렀을 때 모달창 띄우기 + 키보드에서 'Esc' 눌렀을 때 모달창 없애기
const none = () => {
    document.getElementById('cancelWrapper').style.display = 'block';
    document.documentElement.style.overflow = 'hidden';

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.getElementById('cancelWrapper').style.display = 'none';
            document.documentElement.style.overflow = '';
        }
    });
};

// 삭제 모달창 취소 버튼 눌렀을 때, 삭제 모달창 없애기
const cancelORdelete = (canORdel) => {
    if (canORdel === 'continueWrite') {
        document.getElementById('cancelWrapper').style.display = 'none';
        document.documentElement.style.overflow = '';
    } else if (canORdel === 'cancelWrapper') {
        const query = location.search;
        const url = new URLSearchParams(query);
        const diaryId = Number(url.get('id'));

        diaryList = diaryList.filter((el) => el.id !== diaryId);
        localStorage.setItem('diaryList', JSON.stringify(diaryList));

        location.replace('./index.html');
    }
};

// 내용복사 누르면 텍스트 복사하기
const toast = () => {
    const query = location.search;
    const url = new URLSearchParams(query);
    const diaryId = Number(url.get('id'));
    const diary = diaryList.find((el) => el.id === diaryId);

    if (!diary) return;

    const contentTxt = diary.diaryContent;
    navigator.clipboard.writeText(contentTxt);

    document.getElementById('toastTxt').style.animation = 'toast 1s;';
    document.getElementById('toastTxt').style.opacity = '1';
    setTimeout(() => {
        document.getElementById('toastTxt').style.opacity = '0';
    }, 1000);
};
