
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, updateReport, updateAmbulanceStatus } from '../../api/api';


import { useAuthStore } from '../../store/useAuthStore';

const ReportWritePage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const report = await getReportById(reportId);
                setContent(report.content || '');
            } catch (error) {
                alert('보고서 정보를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await updateReport(reportId, { content });
            await updateAmbulanceStatus(user.userId, 'wait');
            alert('보고서가 제출되고 상태가 변경되었습니다.');
            navigate('/emergency/waiting');
        } catch (error) {
            alert('보고서 제출 또는 상태 변경에 실패했습니다.');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">이송 보고서 작성</h1>
            <textarea
                className="w-full h-64 p-2 border rounded"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="특이사항을 입력하세요..."
            />
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
                {isSubmitting ? '제출 중...' : '작성 완료'}
            </button>
        </div>
    );
};

export default ReportWritePage;
