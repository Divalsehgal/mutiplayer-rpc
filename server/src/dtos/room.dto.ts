export interface CreateRoomRequest {
    hostName: string;
    gameType: string;
}

export interface JoinRoomRequest {
    roomId: string;
    name: string;
}

export interface LeaveRoomRequest {
    roomId: string;
}

export interface ExtendRoomRequest {
    roomId: string;
}

export interface RoomResponse {
    ok: boolean;
    roomId?: string;
    room?: any;
    error?: string;
}
