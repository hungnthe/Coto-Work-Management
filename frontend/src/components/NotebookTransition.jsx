import React, { useState, useEffect } from 'react';

/**
 * NotebookTransition - Hiệu ứng sổ tay lật mở khi login
 *
 * Cách dùng: <NotebookTransition show={true} onComplete={() => setShow(false)} />
 *
 * Luồng animation:
 *   closed → opening (bìa lật mở 0.7s) → opened (hiện trang trong 0.3s) → fading (fade out 0.5s) → done
 */
const NotebookTransition = ({ show, onComplete }) => {
    const [phase, setPhase] = useState('closed');

    useEffect(() => {
        if (!show) {
            setPhase('closed');
            return;
        }

        // Chạy chuỗi animation
        setPhase('closed');
        const t1 = setTimeout(() => setPhase('opening'), 50);
        const t2 = setTimeout(() => setPhase('opened'), 750);
        const t3 = setTimeout(() => setPhase('fading'), 1050);
        const t4 = setTimeout(() => {
            setPhase('done');
            onComplete?.();
        }, 1550);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [show, onComplete]);

    if (!show || phase === 'done') return null;

    const isOpen = phase === 'opening' || phase === 'opened' || phase === 'fading';
    const showInner = phase === 'opened' || phase === 'fading';
    const isFading = phase === 'fading';

    return (
        <>
            <style>{notebookStyles}</style>
            <div className={`nb-overlay ${isFading ? 'nb-fading' : ''}`}>
                {/* Particles trang trí */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="nb-particle" style={{
                        left: `${15 + i * 14}%`,
                        top: `${20 + (i % 3) * 25}%`,
                        animationDelay: `${i * 0.5}s`,
                        width: `${2 + (i % 3)}px`,
                        height: `${2 + (i % 3)}px`,
                    }} />
                ))}

                <div className="nb-scene">
                    <div className="nb-book">
                        {/* Trang bên trong (hiện khi mở) */}
                        <div className={`nb-inner ${showInner ? 'nb-visible' : ''}`}>
                            <div className="nb-inner-page">
                                <div className="nb-lines" />
                                <div className="nb-margin" />
                                <div className="nb-page-title">Công việc hôm nay</div>
                                <div className="nb-page-date">
                                    {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                                </div>
                                <div className="nb-task">
                                    <div className="nb-check nb-checked" />
                                    <span>Họp giao ban sáng thứ 2</span>
                                </div>
                                <div className="nb-task">
                                    <div className="nb-check nb-checked" />
                                    <span>Nộp báo cáo tuần</span>
                                </div>
                                <div className="nb-task">
                                    <div className="nb-check" />
                                    <span>Review tài liệu dự án</span>
                                </div>
                                <div className="nb-task">
                                    <div className="nb-check" />
                                    <span>Cập nhật tiến độ công việc</span>
                                </div>
                            </div>
                            <div className="nb-inner-page">
                                <div className="nb-lines" />
                                <div className="nb-margin" />
                                <div className="nb-page-title">Ghi chú</div>
                                <div className="nb-page-date">Nhắc nhở quan trọng</div>
                                <div className="nb-task">
                                    <div className="nb-check" />
                                    <span>Deadline dự án: 15/03</span>
                                </div>
                                <div className="nb-task">
                                    <div className="nb-check" />
                                    <span>Họp với đối tác chiều T4</span>
                                </div>
                                <div className="nb-task">
                                    <div className="nb-check nb-checked" />
                                    <span>Gửi email xác nhận</span>
                                </div>
                            </div>
                        </div>

                        {/* Gáy sách */}
                        <div className="nb-spine" />

                        {/* Bìa trái */}
                        <div className={`nb-page nb-left ${isOpen ? 'nb-open' : ''}`}>
                            <div className="nb-front nb-cover-left">
                                <div className="nb-emblem">
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <div className="nb-cover-title">Sổ Công Việc</div>
                                <div className="nb-cover-sub">Hệ thống Cô Tô</div>
                            </div>
                            <div className="nb-back nb-back-left" />
                        </div>

                        {/* Bìa phải */}
                        <div className={`nb-page nb-right ${isOpen ? 'nb-open' : ''}`}>
                            <div className="nb-front nb-cover-right" />
                            <div className="nb-back nb-back-right" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ============================================================
// CSS - Tách riêng để dễ đọc
// ============================================================
const notebookStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:wght@400;500&display=swap');

  .nb-overlay {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
    transition: opacity 0.5s ease-out;
  }
  .nb-overlay.nb-fading { opacity: 0; pointer-events: none; }

  .nb-scene { perspective: 1800px; width: 560px; height: 380px; }
  .nb-book { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }

  .nb-spine {
    position: absolute; left: 50%; top: 0; transform: translateX(-50%);
    width: 16px; height: 100%;
    background: linear-gradient(to right, #78350f, #92400e, #78350f);
    z-index: 10; border-radius: 2px;
    box-shadow: 0 0 20px rgba(120,53,15,0.5);
  }

  .nb-page {
    position: absolute; top: 0; width: 50%; height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nb-front, .nb-back {
    position: absolute; inset: 0;
    backface-visibility: hidden; border-radius: 4px; overflow: hidden;
  }

  /* Bìa trái */
  .nb-left { left: 0; transform-origin: right center; transform: rotateY(0deg); }
  .nb-left.nb-open { transform: rotateY(-178deg); }
  .nb-cover-left {
    background: linear-gradient(145deg, #92400e, #78350f, #451a03);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 32px; box-shadow: inset -4px 0 12px rgba(0,0,0,0.3);
  }
  .nb-cover-left::before {
    content: ''; position: absolute; inset: 8px;
    border: 1.5px solid rgba(255,215,0,0.3); border-radius: 2px; pointer-events: none;
  }
  .nb-cover-left::after {
    content: ''; position: absolute; inset: 14px;
    border: 0.5px solid rgba(255,215,0,0.15); border-radius: 2px; pointer-events: none;
  }
  .nb-back-left {
    background: linear-gradient(135deg, #fefce8, #fef9c3, #fef3c7);
    transform: rotateY(180deg); box-shadow: inset 4px 0 12px rgba(0,0,0,0.08);
  }

  /* Bìa phải */
  .nb-right { right: 0; transform-origin: left center; transform: rotateY(0deg); }
  .nb-right.nb-open { transform: rotateY(178deg); }
  .nb-cover-right {
    background: linear-gradient(215deg, #92400e, #78350f, #451a03);
    box-shadow: inset 4px 0 12px rgba(0,0,0,0.3);
  }
  .nb-cover-right::before {
    content: ''; position: absolute; inset: 8px;
    border: 1.5px solid rgba(255,215,0,0.3); border-radius: 2px;
  }
  .nb-back-right {
    background: linear-gradient(225deg, #fefce8, #fef9c3, #fef3c7);
    transform: rotateY(180deg); box-shadow: inset -4px 0 12px rgba(0,0,0,0.08);
  }

  /* Trang bên trong */
  .nb-inner {
    position: absolute; top: 4px; bottom: 4px;
    left: calc(50% - 260px + 8px); right: calc(50% - 260px + 8px);
    display: flex; gap: 16px;
    opacity: 0; transition: opacity 0.3s ease 0.4s;
  }
  .nb-inner.nb-visible { opacity: 1; }
  .nb-inner-page {
    flex: 1; background: linear-gradient(180deg, #fffbeb, #fef3c7);
    border-radius: 2px; padding: 24px 20px; position: relative; overflow: hidden;
  }
  .nb-lines {
    position: absolute; inset: 60px 20px 20px;
    background: repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(217,119,6,0.12) 27px, rgba(217,119,6,0.12) 28px);
  }
  .nb-margin {
    position: absolute; top: 0; bottom: 0; left: 52px;
    width: 1px; background: rgba(239,68,68,0.2);
  }

  /* Trang trí bìa */
  .nb-emblem {
    width: 56px; height: 56px; border: 2px solid rgba(255,215,0,0.5);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }
  .nb-emblem svg { width: 28px; height: 28px; color: rgba(255,215,0,0.7); }
  .nb-cover-title {
    font-family: 'Playfair Display', serif; color: rgba(255,215,0,0.8);
    font-size: 15px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; text-align: center;
  }
  .nb-cover-sub {
    font-family: 'Lora', serif; color: rgba(255,215,0,0.4);
    font-size: 11px; margin-top: 8px; letter-spacing: 1.5px;
  }

  /* Nội dung trang trong */
  .nb-page-title {
    font-family: 'Playfair Display', serif; font-size: 13px;
    color: #92400e; font-weight: 700; margin-bottom: 4px;
  }
  .nb-page-date { font-family: 'Lora', serif; font-size: 10px; color: #b45309; opacity: 0.6; }
  .nb-task {
    display: flex; align-items: flex-start; gap: 8px; margin-top: 12px;
    font-family: 'Lora', serif; font-size: 11.5px; color: #78350f; line-height: 1.5;
  }
  .nb-check {
    width: 13px; height: 13px; border: 1.5px solid #d97706;
    border-radius: 2px; flex-shrink: 0; margin-top: 2px;
  }
  .nb-check.nb-checked { background: #d97706; position: relative; }
  .nb-check.nb-checked::after {
    content: '✓'; position: absolute; color: white; font-size: 9px; top: -1px; left: 1.5px;
  }

  .nb-particle {
    position: absolute; width: 3px; height: 3px;
    background: rgba(255,215,0,0.3); border-radius: 50%;
    animation: nb-float 3s ease-in-out infinite;
  }
  @keyframes nb-float {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
    50% { transform: translateY(-20px) scale(1.5); opacity: 0.6; }
  }
`;

export default NotebookTransition;