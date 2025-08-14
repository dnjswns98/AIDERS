import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFireStationStore from '../../store/useFireStationStore';

// 헬퍼 함수: 날짜 포맷팅
const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 헬퍼 함수: 보고서 내용을 섹션별로 파싱
const parseReportContent = (content) => {
    if (!content) return {};
    const sections = {};
    const lines = content.split('\\n');
    let currentSection = '';

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^\d+\)/)) {
            currentSection = trimmedLine.substring(trimmedLine.indexOf(')') + 1).trim();
            sections[currentSection] = [];
        } else if (currentSection && trimmedLine) {
            sections[currentSection].push(trimmedLine);
        }
    });
    return sections;
};

const FireStationReportDetail = () => {
    const { reportId } = useParams();
    const { fetchReportById } = useFireStationStore();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parsedContent, setParsedContent] = useState({});

    useEffect(() => {
        const loadReport = async () => {
            if (reportId) {
                setLoading(true);
                try {
                    const reportData = await fetchReportById(reportId);
                    setReport(reportData);
                    setParsedContent(parseReportContent(reportData.content));
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadReport();
    }, [reportId, fetchReportById]);

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>보고서 상세 정보를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-50 min-h-full flex items-center justify-center">
                <div className="text-center text-red-600">
                    <h2 className="text-xl font-bold mb-2">오류 발생</h2>
                    <p>{error}</p>
                    <Link to="/firestation/reports-list" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="p-8 bg-gray-50 min-h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <h2 className="text-xl font-bold mb-2">보고서 없음</h2>
                    <p>해당 ID의 보고서를 찾을 수 없습니다.</p>
                    <Link to="/firestation/reports-list" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/firestation/reports-list" className="text-blue-600 hover:underline">
                        &larr; 보고서 목록으로 돌아가기
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b">
                        <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            보고서 ID: {report.reportId} | 생성일: {formatDate(report.createdAt)}
                        </p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 요약 정보 */}
                        <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">AI 요약</h3>
                            <p className="text-sm text-blue-900 whitespace-pre-line">{report.summary || '요약 정보가 없습니다.'}</p>
                        </div>

                        {/* 상세 정보 */}
                        {Object.entries(parsedContent).map(([section, lines]) => (
                            <div key={section} className="md:col-span-2">
                                <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">{section}</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    {Array.isArray(lines) ? lines.map((line, index) => <p key={index}>{line}</p>) : <p>{lines}</p>}
                                </div>
                            </div>
                        ))}

                        {/* 기본 정보 */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-md">
                                <span className="font-medium text-gray-500">KTAS 등급: </span>
                                <span className="font-bold text-gray-800">{report.ktas || '-'}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <span className="font-medium text-gray-500">이송 병원: </span>
                                <span className="font-bold text-gray-800">{report.hospitalName || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FireStationReportDetail;