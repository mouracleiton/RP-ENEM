/**
 * P2P Sync Service using WebRTC
 * Enables decentralized data synchronization between peers
 */

interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  status: 'connecting' | 'connected' | 'disconnected';
  lastSeen: number;
}

interface SyncMessage {
  type: 'sync_request' | 'sync_response' | 'data_update' | 'conflict_resolution' | 'heartbeat';
  senderId: string;
  timestamp: number;
  payload: unknown;
  version?: number;
  checksum?: string;
}

interface ConflictResolution {
  strategy: 'newest' | 'merge' | 'local' | 'remote';
  resolver?: (local: unknown, remote: unknown) => unknown;
}

type SyncEventType = 'peer_connected' | 'peer_disconnected' | 'sync_started' | 'sync_completed' | 'conflict_detected' | 'data_received';

interface SyncEvent {
  type: SyncEventType;
  peerId?: string;
  data?: unknown;
}

type SyncEventListener = (event: SyncEvent) => void;

export class P2PSyncService {
  private peerId: string;
  private peers: Map<string, PeerConnection> = new Map();
  private eventListeners: Map<SyncEventType, Set<SyncEventListener>> = new Map();
  private localData: Map<string, { data: unknown; version: number; timestamp: number }> = new Map();
  private conflictResolution: ConflictResolution = { strategy: 'newest' };
  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  constructor() {
    this.peerId = this.generatePeerId();
  }

  private generatePeerId(): string {
    return `peer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  getPeerId(): string {
    return this.peerId;
  }

  // Event system
  on(eventType: SyncEventType, listener: SyncEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  off(eventType: SyncEventType, listener: SyncEventListener): void {
    this.eventListeners.get(eventType)?.delete(listener);
  }

  private emit(event: SyncEvent): void {
    this.eventListeners.get(event.type)?.forEach(listener => listener(event));
  }

  // Create offer for initiating connection
  async createOffer(): Promise<{ offer: RTCSessionDescriptionInit; peerId: string }> {
    const peerConnection = new RTCPeerConnection(this.rtcConfig);
    const tempId = `pending_${Date.now()}`;

    // Create data channel
    const dataChannel = peerConnection.createDataChannel('sync', {
      ordered: true,
    });

    this.setupDataChannel(dataChannel, tempId);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Store pending connection
    this.peers.set(tempId, {
      id: tempId,
      connection: peerConnection,
      dataChannel,
      status: 'connecting',
      lastSeen: Date.now(),
    });

    return { offer, peerId: tempId };
  }

  // Accept offer and create answer
  async acceptOffer(
    offer: RTCSessionDescriptionInit,
    remotePeerId: string
  ): Promise<RTCSessionDescriptionInit> {
    const peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Handle incoming data channel
    peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, remotePeerId);
      const peer = this.peers.get(remotePeerId);
      if (peer) {
        peer.dataChannel = event.channel;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Set remote description and create answer
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Store connection
    this.peers.set(remotePeerId, {
      id: remotePeerId,
      connection: peerConnection,
      dataChannel: null,
      status: 'connecting',
      lastSeen: Date.now(),
    });

    return answer;
  }

  // Complete connection with answer
  async completeConnection(answer: RTCSessionDescriptionInit, tempPeerId: string): Promise<void> {
    const peer = this.peers.get(tempPeerId);
    if (!peer) {
      throw new Error('Peer connection not found');
    }

    await peer.connection.setRemoteDescription(answer);
  }

  private setupDataChannel(dataChannel: RTCDataChannel, peerId: string): void {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with peer: ${peerId}`);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.status = 'connected';
        peer.lastSeen = Date.now();
      }
      this.emit({ type: 'peer_connected', peerId });

      // Send initial sync request
      this.sendMessage(peerId, {
        type: 'sync_request',
        senderId: this.peerId,
        timestamp: Date.now(),
        payload: this.getLocalDataSummary(),
      });
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed with peer: ${peerId}`);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.status = 'disconnected';
      }
      this.emit({ type: 'peer_disconnected', peerId });
    };

    dataChannel.onmessage = (event) => {
      this.handleMessage(peerId, event.data);
    };

    dataChannel.onerror = (error) => {
      console.error(`Data channel error with peer ${peerId}:`, error);
    };
  }

  private handleMessage(peerId: string, data: string): void {
    try {
      const message: SyncMessage = JSON.parse(data);

      // Update last seen
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.lastSeen = Date.now();
      }

      switch (message.type) {
        case 'sync_request':
          this.handleSyncRequest(peerId, message);
          break;
        case 'sync_response':
          this.handleSyncResponse(peerId, message);
          break;
        case 'data_update':
          this.handleDataUpdate(peerId, message);
          break;
        case 'conflict_resolution':
          this.handleConflictResolution(peerId, message);
          break;
        case 'heartbeat':
          // Just update last seen, already done above
          break;
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  private handleSyncRequest(peerId: string, message: SyncMessage): void {
    this.emit({ type: 'sync_started', peerId });

    // Send our data as response
    const response: SyncMessage = {
      type: 'sync_response',
      senderId: this.peerId,
      timestamp: Date.now(),
      payload: this.getAllLocalData(),
    };

    this.sendMessage(peerId, response);
  }

  private handleSyncResponse(peerId: string, message: SyncMessage): void {
    const remoteData = message.payload as Record<string, { data: unknown; version: number; timestamp: number }>;

    // Merge data
    for (const [key, remote] of Object.entries(remoteData)) {
      const local = this.localData.get(key);

      if (!local) {
        // We don't have this data, accept remote
        this.localData.set(key, remote);
        this.emit({ type: 'data_received', data: { key, value: remote.data } });
      } else {
        // Check for conflicts
        const resolved = this.resolveConflict(key, local, remote);
        if (resolved !== local) {
          this.localData.set(key, resolved);
          this.emit({ type: 'data_received', data: { key, value: resolved.data } });
        }
      }
    }

    this.emit({ type: 'sync_completed', peerId });
  }

  private handleDataUpdate(peerId: string, message: SyncMessage): void {
    const update = message.payload as { key: string; data: unknown; version: number };
    const local = this.localData.get(update.key);

    if (!local || update.version > local.version) {
      this.localData.set(update.key, {
        data: update.data,
        version: update.version,
        timestamp: message.timestamp,
      });
      this.emit({ type: 'data_received', data: { key: update.key, value: update.data } });
    } else if (update.version === local.version && message.timestamp > local.timestamp) {
      // Same version but newer timestamp - potential conflict
      this.emit({ type: 'conflict_detected', data: { key: update.key, local, remote: update } });
    }
  }

  private handleConflictResolution(peerId: string, message: SyncMessage): void {
    const resolution = message.payload as { key: string; resolvedData: unknown; version: number };
    this.localData.set(resolution.key, {
      data: resolution.resolvedData,
      version: resolution.version,
      timestamp: message.timestamp,
    });
  }

  private resolveConflict(
    key: string,
    local: { data: unknown; version: number; timestamp: number },
    remote: { data: unknown; version: number; timestamp: number }
  ): { data: unknown; version: number; timestamp: number } {
    // If versions are different, use higher version
    if (local.version !== remote.version) {
      return local.version > remote.version ? local : remote;
    }

    // Same version, use conflict resolution strategy
    switch (this.conflictResolution.strategy) {
      case 'newest':
        return local.timestamp > remote.timestamp ? local : remote;
      case 'local':
        return local;
      case 'remote':
        return remote;
      case 'merge':
        if (this.conflictResolution.resolver) {
          return {
            data: this.conflictResolution.resolver(local.data, remote.data),
            version: Math.max(local.version, remote.version) + 1,
            timestamp: Date.now(),
          };
        }
        return local.timestamp > remote.timestamp ? local : remote;
      default:
        return local;
    }
  }

  private sendMessage(peerId: string, message: SyncMessage): void {
    const peer = this.peers.get(peerId);
    if (peer?.dataChannel?.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify(message));
    }
  }

  // Public API for data management
  setLocalData(key: string, data: unknown, version: number = 1): void {
    const entry = {
      data,
      version,
      timestamp: Date.now(),
    };
    this.localData.set(key, entry);

    // Broadcast update to all connected peers
    this.broadcastUpdate(key, entry);
  }

  getLocalData(key: string): unknown | null {
    return this.localData.get(key)?.data || null;
  }

  private getLocalDataSummary(): Record<string, { version: number; timestamp: number; checksum: string }> {
    const summary: Record<string, { version: number; timestamp: number; checksum: string }> = {};
    for (const [key, value] of this.localData) {
      summary[key] = {
        version: value.version,
        timestamp: value.timestamp,
        checksum: this.generateChecksum(value.data),
      };
    }
    return summary;
  }

  private getAllLocalData(): Record<string, { data: unknown; version: number; timestamp: number }> {
    const allData: Record<string, { data: unknown; version: number; timestamp: number }> = {};
    for (const [key, value] of this.localData) {
      allData[key] = value;
    }
    return allData;
  }

  private generateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private broadcastUpdate(key: string, entry: { data: unknown; version: number; timestamp: number }): void {
    const message: SyncMessage = {
      type: 'data_update',
      senderId: this.peerId,
      timestamp: Date.now(),
      payload: { key, ...entry },
    };

    for (const [peerId] of this.peers) {
      this.sendMessage(peerId, message);
    }
  }

  // Start heartbeat to keep connections alive
  startHeartbeat(intervalMs: number = 30000): NodeJS.Timeout {
    return setInterval(() => {
      const heartbeat: SyncMessage = {
        type: 'heartbeat',
        senderId: this.peerId,
        timestamp: Date.now(),
        payload: null,
      };

      for (const [peerId] of this.peers) {
        this.sendMessage(peerId, heartbeat);
      }

      // Check for stale connections
      const staleTimeout = intervalMs * 3;
      for (const [peerId, peer] of this.peers) {
        if (Date.now() - peer.lastSeen > staleTimeout) {
          console.log(`Peer ${peerId} is stale, disconnecting`);
          this.disconnectPeer(peerId);
        }
      }
    }, intervalMs);
  }

  disconnectPeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.dataChannel?.close();
      peer.connection.close();
      this.peers.delete(peerId);
      this.emit({ type: 'peer_disconnected', peerId });
    }
  }

  disconnectAll(): void {
    for (const [peerId] of this.peers) {
      this.disconnectPeer(peerId);
    }
  }

  getConnectedPeers(): string[] {
    return Array.from(this.peers.entries())
      .filter(([_, peer]) => peer.status === 'connected')
      .map(([id]) => id);
  }

  setConflictResolution(resolution: ConflictResolution): void {
    this.conflictResolution = resolution;
  }

  // Generate shareable connection code
  async generateConnectionCode(): Promise<string> {
    const { offer, peerId } = await this.createOffer();
    const connectionData = {
      peerId,
      offer,
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(connectionData));
  }

  // Connect using a connection code
  async connectWithCode(code: string): Promise<string> {
    const connectionData = JSON.parse(atob(code));
    const answer = await this.acceptOffer(connectionData.offer, connectionData.peerId);

    // Return the answer as a code to be shared back
    return btoa(JSON.stringify({
      peerId: this.peerId,
      answer,
      timestamp: Date.now(),
    }));
  }

  // Complete connection with answer code
  async completeConnectionWithCode(code: string, tempPeerId: string): Promise<void> {
    const responseData = JSON.parse(atob(code));
    await this.completeConnection(responseData.answer, tempPeerId);

    // Update peer ID
    const peer = this.peers.get(tempPeerId);
    if (peer) {
      this.peers.delete(tempPeerId);
      peer.id = responseData.peerId;
      this.peers.set(responseData.peerId, peer);
    }
  }
}

// Singleton instance
export const p2pSyncService = new P2PSyncService();
