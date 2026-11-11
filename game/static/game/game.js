const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');

const titleButton = document.getElementById('title-button');

const timer = document.getElementById('timer');
const title = document.getElementById('title');
const message = document.getElementById('message');

const bestDisplay = document.getElementById('best-display');

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');


const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 70,
    width: 40,
    height: 50
};

let isGameOverAnimating = false;
let gameOverAnimationStart = 0;
let pendingGameOverReason = 'mail';

let isClearAnimating = false;
let clearAnimationStart = 0;

let isStartAnimating = false;
let startAnimationStart = 0;

let mails = [];
let documents = [];
let phones = [];
let meetings = [];

function createMails() {
    mails = [
        {
            x: 40,
            y: -40,
            width: 40,
            height: 30,
            speed: 3
        },
        {
            x: 160,
            y: -160,
            width: 40,
            height: 30,
            speed: 3
        },
        {
            x: 280,
            y: -280,
            width: 40,
            height: 30,
            speed: 3
        },
        {
            x: 90,
            y: -400,
            width: 40,
            height: 30,
            speed: 3
        },
        {
            x: 230,
            y: -520,
            width: 40,
            height: 30,
            speed: 3
        }
    ];
}

function createDocuments() {
    documents = [
        {
            x: 80,
            y: -300,
            width: 60,
            height: 45,
            speed: 2
        },
        {
            x: 230,
            y: -550,
            width: 60,
            height: 45,
            speed: 2
        },
        {
            x: 150,
            y: -800,
            width: 60,
            height: 45,
            speed: 2
        }
    ];
}

function createPhones() {
    const now = performance.now();

    phones = [
        {
            x: 70,
            y: -60,
            width: 70,
            height: 55,
            speed: 1.5,
            warningUntil: now + 1000
        },
        {
            x: 250,
            y: -300,
            width: 70,
            height: 55,
            speed: 1.5,
            warningUntil: now + 2200
        }
    ];
}

function createMeetings() {
    const meetingWidth = 140;

    const startX =
        Math.random() < 0.5
            ? 0
            : canvas.width - meetingWidth;

    meetings = [
        {
            x: startX,
            y: -500,
            width: meetingWidth,
            height: 50,
            speed: 1.5
        }
    ];
}

function updateDifficulty(timeLeft) {
    if (timeLeft > 45) {
        // 0〜15秒：ウォーミングアップ
        mails.forEach((mail) => {
            mail.speed = 2.4;
        });

        documents.forEach((documentItem) => {
            documentItem.speed = 1.6;
        });

        phones.forEach((phone) => {
            phone.speed = 1.8;
        });

        meetings.forEach((meeting) => {
            meeting.speed = 1.2;
        });

    } else if (timeLeft > 30) {
        // 15〜30秒：少し忙しくなる
        mails.forEach((mail) => {
            mail.speed = 3.2;
        });

        documents.forEach((documentItem) => {
            documentItem.speed = 2.2;
        });

        phones.forEach((phone) => {
            phone.speed = 2.5;
        });

        meetings.forEach((meeting) => {
            meeting.speed = 1.8;
        });

    } else if (timeLeft > 15) {
        // 30〜45秒：かなり忙しい
        mails.forEach((mail) => {
            mail.speed = 4.1;
        });

        documents.forEach((documentItem) => {
            documentItem.speed = 2.8;
        });

        phones.forEach((phone) => {
            phone.speed = 3.3;
        });

        meetings.forEach((meeting) => {
            meeting.speed = 2.5;
        });

    } else if (timeLeft > 5) {
        // 45〜55秒：終盤
        mails.forEach((mail) => {
            mail.speed = 5.0;
        });

        documents.forEach((documentItem) => {
            documentItem.speed = 3.5;
        });

        phones.forEach((phone) => {
            phone.speed = 4.2;
        });

        meetings.forEach((meeting) => {
            meeting.speed = 3.2;
        });

    } else {
        // 残り5秒：地獄の定時前ラッシュ
        mails.forEach((mail) => {
            mail.speed = 5.8;
        });

        documents.forEach((documentItem) => {
            documentItem.speed = 4.0;
        });

        phones.forEach((phone) => {
            phone.speed = 4.8;
        });

        meetings.forEach((meeting) => {
            meeting.speed = 3.7;
        });
    }
}

const keys = {
    left: false,
    right: false
};

const playerSpeed = 5;
let isPlaying = false;
let countdown = null;
let gameStartTime = 0;
let timeLeft = 60;

let bestTime = Number(localStorage.getItem('bestTime')) || 0;

const titleBest = document.getElementById('title-best');

titleBest.textContent = `${bestTime.toFixed(2)}秒`;

function drawOfficeBackground() {
    ctx.save();

    // 背景を薄くする
    ctx.globalAlpha = 0.45;

    // 壁
    const wallGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    wallGradient.addColorStop(0, '#dbe5ef');
    wallGradient.addColorStop(0.65, '#eef2f5');
    wallGradient.addColorStop(1, '#d6d9dc');

    ctx.fillStyle = wallGradient;
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // 窓
    ctx.fillStyle = '#324a63';
    ctx.fillRect(25, 40, 130, 120);

    // 窓の外、夕方
    const skyGradient = ctx.createLinearGradient(
        0,
        45,
        0,
        155
    );

    skyGradient.addColorStop(0, '#657fa3');
    skyGradient.addColorStop(1, '#f2ae6d');

    ctx.fillStyle = skyGradient;
    ctx.fillRect(30, 45, 120, 110);

    // 窓枠
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(87, 45, 5, 110);
    ctx.fillRect(30, 98, 120, 5);

    // 時計
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(280, 85, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 時計の針
    ctx.beginPath();
    ctx.moveTo(280, 85);
    ctx.lineTo(280, 67);

    ctx.moveTo(280, 85);
    ctx.lineTo(293, 91);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 奥のデスク
    ctx.fillStyle = '#9c7653';

    ctx.fillRect(
        20,
        235,
        120,
        16
    );

    ctx.fillRect(
        220,
        300,
        120,
        16
    );

    // デスク脚
    ctx.fillStyle = '#725439';

    ctx.fillRect(30, 251, 8, 70);
    ctx.fillRect(120, 251, 8, 70);

    ctx.fillRect(230, 316, 8, 70);
    ctx.fillRect(320, 316, 8, 70);

    // モニター1
    drawOfficeMonitor(58, 195);

    // モニター2
    drawOfficeMonitor(255, 260);

    // 床
    ctx.fillStyle = 'rgba(120, 130, 140, 0.16)';
    ctx.fillRect(
        0,
        470,
        canvas.width,
        130
    );

    // 床のライン
    ctx.strokeStyle = 'rgba(90, 100, 110, 0.12)';
    ctx.lineWidth = 1;

    for (let y = 500; y < 600; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFinalCountdown() {
    if (!isPlaying) {
        return;
    }

    if (timeLeft > 5 || timeLeft <= 0) {
        return;
    }

    ctx.save();
    ctx.globalAlpha = 0.55;

    // 数字を少し脈打たせる
    const pulse =
        1 + Math.sin(performance.now() / 100) * 0.08;

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.scale(pulse, pulse);

    // 数字の後ろを少し暗くする
    ctx.fillStyle = 'rgba(20, 30, 45, 0.16)';

    ctx.beginPath();
    ctx.arc(
        0,
        0,
        62,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 数字の影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.font = '900 90px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
        timeLeft,
        4,
        6
    );

    // 数字本体
    ctx.fillStyle = '#ff6b6b';

    ctx.fillText(
        timeLeft,
        0,
        0
    );

    // 補助メッセージ
    ctx.font = '900 16px sans-serif';
    ctx.fillStyle = '#ffffff';

    ctx.fillText(
        'あと少し！',
        0,
        72
    );

    ctx.restore();
}

function drawOfficeMonitor(x, y) {
    // モニター
    ctx.fillStyle = '#344054';
    ctx.fillRect(
        x,
        y,
        55,
        35
    );

    // 画面
    ctx.fillStyle = '#9dc5dd';
    ctx.fillRect(
        x + 5,
        y + 5,
        45,
        25
    );

    // スタンド
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(
        x + 25,
        y + 35,
        6,
        10
    );

    ctx.fillRect(
        x + 17,
        y + 44,
        22,
        4
    );
}

function drawPlayer() {
    const x = player.x;

    // ゲーム中だけ走るアニメーション
    if (isPlaying) {
        runFrame += 0.18;
    }

    const legSwing = Math.sin(runFrame) * 4;
    const armSwing = Math.sin(runFrame) * 3;
    const bounce = Math.abs(Math.sin(runFrame)) * 2;

    const y = player.y - bounce;

    // 頭
    ctx.fillStyle = '#f2c49b';
    ctx.beginPath();
    ctx.arc(
        x + player.width / 2,
        y + 10,
        9,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 髪
    ctx.fillStyle = '#2f2a28';
    ctx.beginPath();
    ctx.arc(
        x + player.width / 2,
        y + 7,
        9,
        Math.PI,
        Math.PI * 2
    );
    ctx.fill();

    // 左腕
    ctx.strokeStyle = '#243b5a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(
        x + 9,
        y + 22
    );
    ctx.lineTo(
        x + 5 + armSwing,
        y + 36
    );
    ctx.stroke();

    // 右腕
    ctx.beginPath();
    ctx.moveTo(
        x + 31,
        y + 22
    );
    ctx.lineTo(
        x + 35 - armSwing,
        y + 36
    );
    ctx.stroke();

    // スーツ
    ctx.fillStyle = '#243b5a';
    ctx.fillRect(
        x + 7,
        y + 18,
        26,
        25
    );

    // シャツ
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
        x + 16,
        y + 18,
        8,
        16
    );

    // ネクタイ
    ctx.fillStyle = '#d94b4b';

    ctx.beginPath();
    ctx.moveTo(x + 18, y + 20);
    ctx.lineTo(x + 22, y + 20);
    ctx.lineTo(x + 21, y + 34);
    ctx.lineTo(x + 19, y + 34);
    ctx.closePath();
    ctx.fill();

    // 左脚
    ctx.strokeStyle = '#182433';
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(
        x + 15,
        y + 41
    );
    ctx.lineTo(
        x + 13 + legSwing,
        y + 49
    );
    ctx.stroke();

    // 右脚
    ctx.beginPath();
    ctx.moveTo(
        x + 25,
        y + 41
    );
    ctx.lineTo(
        x + 27 - legSwing,
        y + 49
    );
    ctx.stroke();

    ctx.lineCap = 'butt';
}

let runFrame = 0;

function updateMails() {
    if (!isPlaying) {
        return;
    }

    mails.forEach((mail) => {
        mail.y += mail.speed;

        if (mail.y > canvas.height) {
            mail.y = -mail.height;

            mail.x = Math.random() * (canvas.width - mail.width);
        }
    });
}

function drawMails() {
    if (
        !isPlaying &&
        !isGameOverAnimating &&
        !isClearAnimating
    ) {
        return;
    }

    mails.forEach((mail) => {
        const x = mail.x;
        const y = mail.y;
        const w = mail.width;
        const h = mail.height;

        ctx.save();

        // 影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(
            x + 3,
            y + 4,
            w,
            h
        );

        // 封筒本体
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            x,
            y,
            w,
            h
        );

        // 封筒の枠
        ctx.strokeStyle = '#53657a';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            y,
            w,
            h
        );

        // 封筒のフタ
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 2);
        ctx.lineTo(x + w / 2, y + h / 2 + 2);
        ctx.lineTo(x + w - 2, y + 2);

        ctx.strokeStyle = '#53657a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 下側の折り目
        ctx.beginPath();

        ctx.moveTo(x + 2, y + h - 2);
        ctx.lineTo(x + w / 2 - 7, y + h / 2 + 5);

        ctx.moveTo(x + w - 2, y + h - 2);
        ctx.lineTo(x + w / 2 + 7, y + h / 2 + 5);

        ctx.stroke();

        // 未読メールっぽい赤い通知
        ctx.fillStyle = '#e63946';

        ctx.beginPath();
        ctx.arc(
            x + w - 3,
            y + 3,
            7,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // 通知マーク
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(
            '!',
            x + w - 3,
            y + 3
        );

        ctx.restore();
    });
}


function updateDocuments() {
    if (!isPlaying) {
        return;
    }

    documents.forEach((documentItem) => {
        documentItem.y += documentItem.speed;

        if (documentItem.y > canvas.height) {
            documentItem.y = -documentItem.height;

            documentItem.x =
                Math.random() * (canvas.width - documentItem.width);
        }
    });
}

function drawDocuments() {
    if (
        !isPlaying &&
        !isGameOverAnimating &&
        !isClearAnimating
    ) {
        return;
    }

    documents.forEach((documentItem) => {
        const x = documentItem.x;
        const y = documentItem.y;
        const w = documentItem.width;
        const h = documentItem.height;

        // 後ろの紙
        ctx.fillStyle = '#d8dce3';
        ctx.fillRect(
            x + 6,
            y + 5,
            w - 4,
            h - 2
        );

        // メインの紙
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            x,
            y,
            w - 6,
            h - 5
        );

        // 枠
        ctx.strokeStyle = '#e0a92f';
        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            y,
            w - 6,
            h - 5
        );

        // 書類の文字を表す線
        ctx.strokeStyle = '#667085';
        ctx.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();

            ctx.moveTo(
                x + 10,
                y + 12 + i * 8
            );

            ctx.lineTo(
                x + w - 20,
                y + 12 + i * 8
            );

            ctx.stroke();
        }

        // 赤い重要マーク
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();

        ctx.arc(
            x + w - 18,
            y + 11,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}

function updatePhones() {
    if (!isPlaying) {
        return;
    }

    const now = performance.now();

    phones.forEach((phone) => {
        // 予告中は落下させない
        if (now < phone.warningUntil) {
            return;
        }

        phone.y += phone.speed;

        // 画面下へ出たら、位置を変えて再予告
        if (phone.y > canvas.height) {
            phone.x = Math.random() * (canvas.width - phone.width);
            phone.y = -phone.height;
            phone.warningUntil = now + 1000;
        }
    });
}

function drawPhones() {
    if (
        !isPlaying &&
        !isGameOverAnimating &&
        !isClearAnimating
    ) {
        return;
    }

    const now = performance.now();

    phones.forEach((phone) => {
        const x = phone.x;
        const y = phone.y;
        const w = phone.width;
        const h = phone.height;

        // 予告中
        if (now < phone.warningUntil) {
            ctx.fillStyle = 'rgba(231, 76, 60, 0.18)';

            ctx.fillRect(
                x,
                0,
                w,
                55
            );

            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;

            ctx.strokeRect(
                x,
                0,
                w,
                55
            );

            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillText(
                '！',
                x + w / 2,
                27
            );

            return;
        }

        // 電話本体のグラデーション
        const phoneGradient = ctx.createLinearGradient(
            x,
            y + 15,
            x,
            y + h
        );

        phoneGradient.addColorStop(0, '#a978d1');
        phoneGradient.addColorStop(0.5, '#7b52ab');
        phoneGradient.addColorStop(1, '#523477');


        // 本体の暗い側面
        ctx.fillStyle = '#4b306c';

        ctx.fillRect(
            x + 12,
            y + 19,
            w - 16,
            h - 15
        );


        // 本体メイン
        ctx.fillStyle = phoneGradient;

        ctx.fillRect(
            x + 8,
            y + 15,
            w - 16,
            h - 15
        );


        // 上面の光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';

        ctx.fillRect(
            x + 11,
            y + 18,
            w - 22,
            5
        );


        // 受話器の影
        ctx.strokeStyle = '#432861';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        ctx.beginPath();

        ctx.moveTo(
            x + 14,
            y + 15
        );

        ctx.quadraticCurveTo(
            x + w / 2,
            y + 2,
            x + w - 14,
            y + 15
        );

        ctx.stroke();


        // 受話器本体
        const receiverGradient = ctx.createLinearGradient(
            x,
            y,
            x,
            y + 20
        );

        receiverGradient.addColorStop(0, '#bd91df');
        receiverGradient.addColorStop(1, '#6e4399');

        ctx.strokeStyle = receiverGradient;
        ctx.lineWidth = 7;

        ctx.beginPath();

        ctx.moveTo(
            x + 14,
            y + 12
        );

        ctx.quadraticCurveTo(
            x + w / 2,
            y,
            x + w - 14,
            y + 12
        );

        ctx.stroke();


        // ボタン部分
        ctx.fillStyle = '#3f285c';

        ctx.fillRect(
            x + 18,
            y + 27,
            w - 36,
            h - 33
        );


        // ボタン
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {

                // ボタンの影
                ctx.fillStyle = '#281a3a';

                ctx.fillRect(
                    x + 22 + col * 11,
                    y + 31 + row * 9,
                    6,
                    6
                );

                // ボタン表面
                ctx.fillStyle = '#eeeaf4';

                ctx.fillRect(
                    x + 21 + col * 11,
                    y + 30 + row * 9,
                    6,
                    6
                );
            }
        }

        ctx.lineCap = 'butt';
    });
}

function updateMeetings() {
    if (!isPlaying) {
        return;
    }

    meetings.forEach((meeting) => {
        meeting.y += meeting.speed;

        if (meeting.y > canvas.height) {
            meeting.y = -meeting.height;

            // 左寄せか右寄せにする
            if (Math.random() < 0.5) {
                meeting.x = 0;
            } else {
                meeting.x = canvas.width - meeting.width;
            }
        }
    });
}

function drawMeetings() {
    if (
        !isPlaying &&
        !isGameOverAnimating &&
        !isClearAnimating
    ) {
        return;
    }

    meetings.forEach((meeting) => {
        const x = meeting.x;
        const y = meeting.y;
        const w = meeting.width;
        const h = meeting.height;

        ctx.save();

        // 椅子・参加者（上側）
        for (let i = 0; i < 3; i++) {
            const personX = x + 35 + i * 40;

            // 頭
            ctx.fillStyle = '#f2c49b';
            ctx.beginPath();
            ctx.arc(
                personX,
                y + 7,
                5,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // 椅子
            ctx.fillStyle = '#58677a';
            ctx.fillRect(
                personX - 8,
                y + 11,
                16,
                7
            );
        }

        // 椅子・参加者（下側）
        for (let i = 0; i < 3; i++) {
            const personX = x + 35 + i * 40;

            // 椅子
            ctx.fillStyle = '#58677a';
            ctx.fillRect(
                personX - 8,
                y + h - 18,
                16,
                7
            );

            // 頭
            ctx.fillStyle = '#f2c49b';
            ctx.beginPath();
            ctx.arc(
                personX,
                y + h - 7,
                5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // テーブルの影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(
            x + 14,
            y + 18,
            w - 20,
            h - 28
        );

        // 会議テーブル
        const tableGradient = ctx.createLinearGradient(
            x,
            y,
            x,
            y + h
        );

        tableGradient.addColorStop(0, '#b9855b');
        tableGradient.addColorStop(1, '#765034');

        ctx.fillStyle = tableGradient;

        ctx.fillRect(
            x + 10,
            y + 14,
            w - 20,
            h - 28
        );

        // テーブル中央の資料
        ctx.fillStyle = '#ffffff';

        ctx.fillRect(
            x + w / 2 - 16,
            y + h / 2 - 7,
            32,
            14
        );

        ctx.strokeStyle = '#9aa4b2';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(
            x + w / 2 - 11,
            y + h / 2 - 2
        );
        ctx.lineTo(
            x + w / 2 + 11,
            y + h / 2 - 2
        );

        ctx.moveTo(
            x + w / 2 - 11,
            y + h / 2 + 3
        );
        ctx.lineTo(
            x + w / 2 + 7,
            y + h / 2 + 3
        );

        ctx.stroke();

        // 「長引く会議」感を出す時計
        const clockX = x + w - 20;
        const clockY = y + 13;

        ctx.fillStyle = '#ffffff';

        ctx.beginPath();
        ctx.arc(
            clockX,
            clockY,
            10,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 時計の針
        ctx.beginPath();
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX, clockY - 6);

        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX + 5, clockY + 3);

        ctx.stroke();

        ctx.restore();
    });
}


function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function checkPhoneCollision(player, phone) {
    const phoneHitbox = {
        x: phone.x + 10,
        y: phone.y + 10,
        width: phone.width - 20,
        height: phone.height - 15
    };

    return checkCollision(player, phoneHitbox);
}

function gameOver(reason = 'mail') {
    if (isGameOverAnimating) {
        return;
    }

    isGameOverAnimating = true;
    gameOverAnimationStart = performance.now();
    pendingGameOverReason = reason;

    // 障害物の移動を止める
    isPlaying = false;

    // カウントダウンも止める
    if (countdown) {
        clearInterval(countdown);
        countdown = null;
    }
}

function drawGameOverAnimation() {
    if (!isGameOverAnimating) {
        return;
    }

    const elapsed =
        performance.now() - gameOverAnimationStart;

    ctx.save();

    // 赤いフラッシュ
    const flashAlpha =
        Math.max(0, 0.32 - elapsed / 2200);

    ctx.fillStyle =
        `rgba(220, 40, 40, ${flashAlpha})`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // 少しだけ拡大
    const scale =
        Math.min(1 + elapsed / 2500, 1.12);

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.scale(scale, scale);

    // 文字の影
    ctx.font = '900 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';

    ctx.fillText(
        '残業確定！',
        3,
        4
    );

    // 文字
    ctx.fillStyle = '#e63946';

    ctx.fillText(
        '残業確定！',
        0,
        0
    );

    ctx.font = '700 17px sans-serif';
    ctx.fillStyle = '#ffffff';

    ctx.fillText(
        '仕事につかまった……',
        0,
        45
    );

    ctx.restore();

    // 0.7秒後にリザルトへ
    if (elapsed >= 700) {
        isGameOverAnimating = false;

        showResult(pendingGameOverReason);
    }
}

function startClearAnimation() {
    if (isClearAnimating) {
        return;
    }

    isPlaying = false;
    isClearAnimating = true;
    clearAnimationStart = performance.now();

    if (countdown) {
        clearInterval(countdown);
        countdown = null;
    }
}

function drawClearAnimation() {
    if (!isClearAnimating) {
        return;
    }

    const elapsed =
        performance.now() - clearAnimationStart;

    ctx.save();

    // 明るいフラッシュ
    const flashAlpha =
        Math.max(0.08, 0.35 - elapsed / 3000);

    ctx.fillStyle =
        `rgba(255, 210, 70, ${flashAlpha})`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // 少し大きくなる演出
    const scale =
        Math.min(
            0.85 + elapsed / 1800,
            1.1
        );

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.scale(scale, scale);

    // 文字の影
    ctx.font = '900 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

    ctx.fillText(
        '定時退社！',
        3,
        4
    );

    // メイン文字
    ctx.fillStyle = '#ffd23f';

    ctx.fillText(
        '定時退社！',
        0,
        0
    );

    // サブメッセージ
    ctx.font = '800 17px sans-serif';
    ctx.fillStyle = '#ffffff';

    ctx.fillText(
        '今日は帰れる！！',
        0,
        48
    );

    ctx.restore();

    // 約1秒後にリザルト
    if (elapsed >= 1000) {
        isClearAnimating = false;

        showClearResult();
    }
}

function showResult(reason = 'mail') {
    const survivalTime =
        (performance.now() - gameStartTime) / 1000;

    // BEST更新
    updateBestTime(survivalTime);

    isPlaying = false;

    if (countdown) {
        clearInterval(countdown);
        countdown = null;
    }

    gameScreen.style.display = 'none';
    resultScreen.style.display = 'block';

    // タイトル
    document.getElementById('result-title').textContent =
        '残業確定';

    // 生存時間によってキャッチコピーを変更
    if (survivalTime < 15) {
        document.getElementById('result-catchcopy').textContent =
            '定時退社への道は険しい……。';

    } else if (survivalTime < 30) {
        document.getElementById('result-catchcopy').textContent =
            'まだ帰れない。もう一度だ。';

    } else if (survivalTime < 50) {
        document.getElementById('result-catchcopy').textContent =
            '定時はもうすぐそこだった……！';

    } else {
        document.getElementById('result-catchcopy').textContent =
            'あと少しだったのに……！';
    }

    // 何につかまったか
    let reasonMessage = '';

    if (reason === 'document') {
        reasonMessage = '書類につかまりました。';

    } else if (reason === 'phone') {
        reasonMessage = '電話につかまりました。';

    } else if (reason === 'meeting') {
        reasonMessage = '会議につかまりました。';

    } else {
        reasonMessage = 'メールにつかまりました。';
    }

    // 結果
    document.getElementById('result-message').innerHTML =
        `${reasonMessage}<br>
        生存時間：${survivalTime.toFixed(2)}秒`;

    // BEST
    document.getElementById('result-best').textContent =
        `BEST TIME：${bestTime.toFixed(2)}秒`;
}

function drawStartAnimation() {
    if (!isStartAnimating) {
        return;
    }

    const elapsed =
        performance.now() - startAnimationStart;

    ctx.save();

    // 最初は大きく、少しずつ通常サイズへ
    const scale =
        Math.max(1, 1.18 - elapsed / 2500);

    // 少しずつ透明にする
    const alpha =
        Math.max(0, 1 - elapsed / 1400);

    ctx.globalAlpha = alpha;

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.scale(scale, scale);

    // 背景
    ctx.fillStyle = 'rgba(20, 30, 45, 0.55)';

    ctx.beginPath();
    ctx.roundRect(
        -145,
        -55,
        290,
        110,
        18
    );
    ctx.fill();

    // メイン
    ctx.font = '900 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';

    ctx.fillText(
        '定時まで残り60秒！',
        2,
        -8
    );

    // 本体
    ctx.fillStyle = '#ffd65a';

    ctx.fillText(
        '定時まで残り60秒！',
        0,
        -10
    );

    // サブメッセージ
    ctx.font = '800 17px sans-serif';
    ctx.fillStyle = '#ffffff';

    ctx.fillText(
        '仕事から逃げ切れ！',
        0,
        28
    );

    ctx.restore();

    // 約1.4秒で終了
    if (elapsed >= 1400) {
        isStartAnimating = false;
    }
}

function updatePlayer() {
    if (!isPlaying) {
        return;
    }

    if (keys.left) {
        player.x -= playerSpeed;
    }

    if (keys.right) {
        player.x += playerSpeed;
    }

    // Canvasの外に出ないようにする
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 通常プレイ中
    if (isPlaying) {
        drawOfficeBackground();

        updatePlayer();
        updateMails();
        updateDocuments();
        updatePhones();
        updateMeetings();

        // メール
        for (const mail of mails) {
            if (checkCollision(player, mail)) {
                gameOver('mail');
                break;
            }
        }

        // 書類
        if (isPlaying) {
            for (const documentItem of documents) {
                if (checkCollision(player, documentItem)) {
                    gameOver('document');
                    break;
                }
            }
        }

        // 電話
        if (isPlaying) {
            const now = performance.now();

            for (const phone of phones) {
                if (
                    now >= phone.warningUntil &&
                    checkPhoneCollision(player, phone)
                ) {
                    gameOver('phone');
                    break;
                }
            }
        }

        // 会議
        if (isPlaying) {
            for (const meeting of meetings) {
                if (checkCollision(player, meeting)) {
                    gameOver('meeting');
                    break;
                }
            }
        }

        // 接触していなければ通常描画
        if (isPlaying) {
            drawMails();
            drawDocuments();
            drawPhones();
            drawMeetings();
            drawPlayer();

            drawFinalCountdown();

            // ゲーム開始演出
            drawStartAnimation();
        }
    }

    // ゲームオーバー演出
    // この処理は isPlaying の外側に置く
    if (isGameOverAnimating) {
        drawOfficeBackground();

        drawMails();
        drawDocuments();
        drawPhones();
        drawMeetings();
        drawPlayer();

        drawGameOverAnimation();
    }

    if (isClearAnimating) {
        drawOfficeBackground();

        drawMails();
        drawDocuments();
        drawPhones();
        drawMeetings();
        drawPlayer();

        drawClearAnimation();
    }

    requestAnimationFrame(gameLoop);
}


document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        keys.left = true;
        event.preventDefault();
    }

    if (event.key === 'ArrowRight') {
        keys.right = true;
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        keys.left = false;
    }

    if (event.key === 'ArrowRight') {
        keys.right = false;
    }
});

let isDragging = false;

function movePlayerToPointer(event) {
    if (!isPlaying) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    // 画面上の座標をCanvas内の座標に変換
    const scaleX = canvas.width / rect.width;
    const pointerX = (event.clientX - rect.left) * scaleX;

    // プレイヤーの中央が指・マウス位置に来るようにする
    player.x = pointerX - player.width / 2;

    // 左端から出ないようにする
    if (player.x < 0) {
        player.x = 0;
    }

    // 右端から出ないようにする
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

canvas.addEventListener('pointerdown', (event) => {
    if (!isPlaying) {
        return;
    }

    isDragging = true;

    canvas.setPointerCapture(event.pointerId);

    movePlayerToPointer(event);
});

canvas.addEventListener('pointermove', (event) => {
    if (!isDragging) {
        return;
    }

    movePlayerToPointer(event);
});

canvas.addEventListener('pointerup', (event) => {
    isDragging = false;

    if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
});

canvas.addEventListener('pointercancel', () => {
    isDragging = false;
});

canvas.style.touchAction = 'none';

function showClearResult() {
    // 60秒をBEST記録に反映
    updateBestTime(60);

    gameScreen.style.display = 'none';
    resultScreen.style.display = 'block';

    // タイトル
    document.getElementById('result-title').textContent =
        '定時退社！';

    // キャッチコピー
    document.getElementById('result-catchcopy').textContent =
        '仕事を全部かわした。今日は帰れる！';

    // 結果
    document.getElementById('result-message').innerHTML =
        `60秒逃げ切りました！<br>
        生存時間：60.00秒`;

    // BEST
    document.getElementById('result-best').textContent =
        `BEST TIME：${bestTime.toFixed(2)}秒`;
}


function startGame() {

    if (countdown) {
        clearInterval(countdown);
        countdown = null;
    }

    titleScreen.style.display = 'none';
    resultScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    isPlaying = true;
    isGameOverAnimating = false;
    isClearAnimating = false;

    isStartAnimating = true;
    startAnimationStart = performance.now();

    runFrame = 0;

    gameStartTime = performance.now();


    createMails();
    createDocuments();
    createPhones();
    createMeetings();

    timeLeft = 60;

    title.textContent = `定時まで残り${timeLeft}秒！`;
    message.textContent = '仕事を避けろ！';
    timer.textContent = timeLeft;

    bestDisplay.textContent =
        `BEST：${bestTime.toFixed(2)}秒`;

    drawPlayer();


    countdown = setInterval(() => {

        timeLeft -= 1;

        timer.textContent = timeLeft;
        title.textContent =
            `定時まで残り${timeLeft}秒！`;

        updateDifficulty(timeLeft);

        if (timeLeft <= 5 && timeLeft > 0) {
            title.textContent =
                `定時まで ${timeLeft}！`;

            message.textContent =
                'あと少し！逃げ切れ！';
        }

        if (timeLeft <= 0) {
            clearInterval(countdown);
            countdown = null;

            startClearAnimation();
        }
    }, 1000);
}

function updateBestTime(survivalTime) {
    if (survivalTime > bestTime) {
        bestTime = survivalTime;

        try {
            localStorage.setItem('bestTime', bestTime.toString());
        } catch (error) {
            console.error('BEST記録を保存できませんでした。', error);
        }

        bestDisplay.textContent =
            `BEST：${bestTime.toFixed(2)}秒`;

        titleBest.textContent =
            `${bestTime.toFixed(2)}秒`;
    }
}

function backToTitle() {
    isPlaying = false;

    if (countdown) {
        clearInterval(countdown);
        countdown = null;
    }

    gameScreen.style.display = 'none';
    resultScreen.style.display = 'none';
    titleScreen.style.display = 'block';

    // 最新のBESTをタイトル画面にも表示
    titleBest.textContent = `${bestTime.toFixed(2)}秒`;
}

startButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);
titleButton.addEventListener('click', backToTitle);

gameLoop();