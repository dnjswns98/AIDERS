import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';
import useWebRtcStore from '../../store/useWebRtcStore';

import { Paper, Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const PipVideoCall = () => {
    const {
        localStream,
        subscriber,
        endCall,
        setPipMode
    } = useWebRtcStore();
    const navigate = useNavigate();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const nodeRef = React.useRef(null);

    React.useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    React.useEffect(() => {
        if (subscriber && remoteVideoRef.current) {
            subscriber.addVideoElement(remoteVideoRef.current);
        } else if (!subscriber && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    }, [subscriber]);

    const handleEndCall = () => {
        endCall();
    };

    const handleGoToDashboard = () => {
        setPipMode(false);
        navigate('/emergency/dashboard');
    };

    return (
        <Draggable handle=".handle" nodeRef={nodeRef}>
            <Box
                ref={nodeRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1300,
                    cursor: 'move',
                }}
                className="handle"
            >
                <Paper
                    elevation={6}
                    sx={{
                        width: '350px',
                        height: '197px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#000',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'auto',
                    }}
                >
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                                width: '90px',
                                height: '50.625px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Box>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '16px',
                                opacity: isHovered ? 1 : 0,
                                transition: 'opacity 0.2s ease-in-out',
                                cursor: 'default',
                            }}
                        >
                            <Tooltip title="전체 화면으로 돌아가기">
                                <IconButton
                                    onClick={handleGoToDashboard}
                                    sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}
                                >
                                    <FullscreenExitIcon />
                                </IconButton>
                            </Tooltip>

                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Draggable>
    );
};

export default PipVideoCall;