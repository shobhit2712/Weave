import { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Phone } from 'lucide-react';
import useCallStore from '../../store/callStore';
import useAuthStore from '../../store/authStore';
import socketService from '../../services/socketService';
import { toast } from 'react-hot-toast';

function VideoCallModal() {
  const { user } = useAuthStore();
  const {
    isInCall,
    isCallIncoming,
    isCallOutgoing,
    callType,
    caller,
    receiver,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    acceptCall,
    rejectCall,
    endCall,
    setLocalStream,
    setRemoteStream,
    toggleMute,
    toggleVideo,
    toggleScreenShare
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get user media on mount if in call
  useEffect(() => {
    if ((isInCall || isCallOutgoing) && !localStream) {
      initializeMedia();
    }

    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInCall, isCallOutgoing]);

  // Update video refs when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isInCall && !isCallIncoming) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setCallDuration(0);
    };
  }, [isInCall, isCallIncoming]);

  const initializeMedia = async () => {
    try {
      setIsConnecting(true);
      const constraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      // Emit call initiation to socket
      if (isCallOutgoing && receiver) {
        console.log('📞 Initiating call to:', receiver);
        socketService.initiateCall(receiver, callType);
        toast.success('Calling...');
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone. Please check permissions.');
      endCall();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAcceptCall = async () => {
    try {
      await initializeMedia();
      acceptCall();
      socketService.answerCall(null, caller._id);
      toast.success('Call connected');
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
    }
  };

  const handleRejectCall = () => {
    if (caller) {
      socketService.rejectCall(caller._id);
    }
    rejectCall();
    toast.info('Call rejected');
  };

  const handleEndCall = () => {
    if (receiver) {
      socketService.endCall(receiver);
    } else if (caller) {
      socketService.endCall(caller._id);
    }
    endCall();
    toast.info('Call ended');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInCall && !isCallIncoming && !isCallOutgoing) {
    return null;
  }

  const otherUser = caller || receiver;
  const otherUserName = otherUser?.fullName || 'Unknown User';

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl p-0 overflow-hidden bg-base-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-base-100 border-b border-base-300">
          <div>
            <h3 className="font-semibold text-lg">{otherUserName}</h3>
            <p className="text-sm text-base-content/60">
              {isCallIncoming ? 'Incoming call...' : isConnecting ? 'Connecting...' : isInCall ? formatDuration(callDuration) : 'Calling...'}
            </p>
          </div>
          {!isCallIncoming && (
            <button
              onClick={handleEndCall}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Video Area */}
        <div className="relative bg-base-300" style={{ height: '500px' }}>
          {/* Remote Video (Full Screen) */}
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-primary text-primary-content rounded-full w-24 h-24">
                    <span className="text-3xl">{otherUserName[0]}</span>
                  </div>
                </div>
                <p className="text-base-content/60">
                  {isCallIncoming ? 'Incoming call...' : 'Waiting for response...'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          {localStream && callType === 'video' && !isVideoOff && (
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-base-100 rounded-lg overflow-hidden shadow-lg border-2 border-base-300">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-base-100">
          {isCallIncoming ? (
            /* Incoming Call Controls */
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRejectCall}
                className="btn btn-error btn-circle btn-lg"
              >
                <X size={24} />
              </button>
              <button
                onClick={handleAcceptCall}
                className="btn btn-success btn-circle btn-lg"
              >
                <Phone size={24} />
              </button>
            </div>
          ) : (
            /* Active Call Controls */
            <div className="flex justify-center items-center gap-3">
              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className={`btn btn-circle ${isMuted ? 'btn-error' : 'btn-ghost'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Video On/Off */}
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`btn btn-circle ${isVideoOff ? 'btn-error' : 'btn-ghost'}`}
                  title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
              )}

              {/* Screen Share */}
              {callType === 'video' && (
                <button
                  onClick={toggleScreenShare}
                  className={`btn btn-circle ${isScreenSharing ? 'btn-primary' : 'btn-ghost'}`}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                </button>
              )}

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="btn btn-error btn-circle btn-lg"
                title="End call"
              >
                <Phone size={24} className="rotate-[135deg]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCallModal;
