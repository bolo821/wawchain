export const TOGGLE_CREATE_ROOM_MODAL = 'ROOM REDUCER TOGGLE CREATE ROOM MODAL';
export const TOGGLE_APPROVE_MODAL = 'ROOM REDUCER TOGGLE APPROVE MODAL';
export const ADD_ROOM_LINK = 'ROOM REDUCER ADD ROOM LINK';

export const toggleCreateRoomModal = (flag) => {
	return {
		type: TOGGLE_CREATE_ROOM_MODAL,
		payload: flag,
	}
}

export const toggleApproveModal = (flag) => {
	return {
		type: TOGGLE_APPROVE_MODAL,
		payload: flag,
	}
}

export const addRoomLink = (data) => {
	return {
		type: ADD_ROOM_LINK,
		payload: data,
	}
}