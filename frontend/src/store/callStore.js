import { create } from 'zustand';

const useCallStore = create((set, get) => ({
  isInCall: false,
  callType: null, // 'audio' or 'video'
  caller: null,
  receiver: null,
  localStream: null,
  remoteStream: null,
  peer: null,
  isCallIncoming: false,
  isCallOutgoing: false,
  isMuted: false,
  isVideoOff: false,
  isScreenSharing: false,

  startCall: (callType, receiverId) => {
    console.log('🔵 startCall:', { callType, receiverId });
    set({
      isInCall: true,
      callType,
      receiver: receiverId,
      isCallOutgoing: true,
      isCallIncoming: false
    });
  },

  receiveCall: (callType, caller) => {
    console.log('🔵 receiveCall:', { callType, caller });
    set({
      isCallIncoming: true,
      callType,
      caller,
      isCallOutgoing: false
    });
  },

  acceptCall: () => set({
    isInCall: true,
    isCallIncoming: false
  }),

  rejectCall: () => set({
    isCallIncoming: false,
    caller: null,
    callType: null
  }),

  endCall: () => {
    const state = get();
    
    // Stop all tracks
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    if (state.remoteStream) {
      state.remoteStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (state.peer) {
      state.peer.destroy();
    }
    
    set({
      isInCall: false,
      callType: null,
      caller: null,
      receiver: null,
      localStream: null,
      remoteStream: null,
      peer: null,
      isCallIncoming: false,
      isCallOutgoing: false,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false
    });
  },

  setLocalStream: (stream) => set({ localStream: stream }),
  
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  
  setPeer: (peer) => set({ peer }),

  toggleMute: () => {
    const state = get();
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = state.isMuted;
      });
    }
    set({ isMuted: !state.isMuted });
  },

  toggleVideo: () => {
    const state = get();
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = state.isVideoOff;
      });
    }
    set({ isVideoOff: !state.isVideoOff });
  },

  toggleScreenShare: async () => {
    const state = get();
    
    if (state.isScreenSharing) {
      // Stop screen sharing, return to camera
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        set({ localStream: stream, isScreenSharing: false });
        return stream;
      } catch (error) {
        console.error('Error returning to camera:', error);
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true 
        });
        
        // Keep audio from original stream
        if (state.localStream) {
          const audioTrack = state.localStream.getAudioTracks()[0];
          if (audioTrack) {
            screenStream.addTrack(audioTrack);
          }
        }
        
        set({ localStream: screenStream, isScreenSharing: true });
        return screenStream;
      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    }
  }
}));

export default useCallStore;
