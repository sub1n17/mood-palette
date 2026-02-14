const query = location.search;
const url = new URLSearchParams(query);
const diaryId = Number(url.get('id'));

window.onload = () => {
    const put_diaryList = localStorage.getItem('diaryList') ?? '[]';
    const diaryList = JSON.parse(put_diaryList);
    const diary = diaryList.find((el) => el.id === diaryId);

    if (!diary) {
        location.replace('./index.html');
        return;
    }
    document.getElementById('edit_title').value = diary.diaryTitle;
    document.getElementById('edit_content').value = diary.diaryContent;

    switch (diary.diaryFeel) {
        case 'happy': {
            document.getElementById('happy').checked = true;
            break;
        }
        case 'sad': {
            document.getElementById('sad').checked = true;
            break;
        }
        case 'sur': {
            document.getElementById('sur').checked = true;
            break;
        }
        case 'ang': {
            document.getElementById('ang').checked = true;
            break;
        }
        case 'etc': {
            document.getElementById('etc').checked = true;
            break;
        }
    }

    const commentList = diary.commentList ?? [];
    const commentAll = commentList
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

const edit = () => {
    const editTitle = document.getElementById('edit_title').value;
    const editContent = document.getElementById('edit_content').value;

    let editFeel;
    document.getElementsByName('feel').forEach((el) => {
        if (el.checked) {
            editFeel = el.value;
        }
    });

    const put_diaryList = localStorage.getItem('diaryList') ?? '[]';
    const diaryList = JSON.parse(put_diaryList);

    const diary = diaryList.find((el) => el.id === diaryId);

    if (!diary) return;

    diary.diaryFeel = editFeel;
    diary.diaryTitle = editTitle;
    diary.diaryContent = editContent;

    localStorage.setItem('diaryList', JSON.stringify(diaryList));

    location.replace(`./detail.html?id=${diaryId}`);
};

const cancel = () => {
    location.replace(`./detail.html?id=${diaryId}`);
};

const goDetail = () => {
    location.replace(`./detail.html?id=${diaryId}`);
};
