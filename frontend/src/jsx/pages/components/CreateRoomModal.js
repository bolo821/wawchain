import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Modal,
	Button,
} from 'react-bootstrap';

import { toggleCreateRoomModal } from '../../../actions/room';
import { setMessage } from '../../../actions/message';
import { SOCKET } from '../../../apiConfig';

const initFormData = {
	name: '',
}

const CreateRoomModal = () => {
	const dispatch = useDispatch();
	const showModal = useSelector(state => state.room.createModalShow);
	const user = useSelector(state => state.user.user);
	const [form, setForm] = useState(() => initFormData);

	const handleChange = (e) => {
		switch (e.target.name) {
			case 'name': {
				setForm({
					...form,
					name: e.target.value,
				});
				break;
			}
			default: {
				break;
			}
		}
	}

	const handleClose = () => {
		dispatch(toggleCreateRoomModal(false));
	}
	
	const handleSubmit = () => {
		SOCKET.emit('CREATE_ROOM', {
			...form,
			user: {...user, ready: false},
			joinedTo: null,
			socket: SOCKET.id,
			status: 'Join',
			joiner: null,
		}, (flag) => {
			if (!flag) {
				dispatch(setMessage({
					message: 'Room name already exists.',
					display: true,
				}));
			} else {
				dispatch(toggleCreateRoomModal(false));
			}
		});
	}

	return (
		<Modal show={showModal} onHide={handleClose}>
			<div className="card m-0">
				<div className="card-body">
					<Modal.Header closeButton>
						<Modal.Title>Create a new room</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form method="post" name="myform" className="signin_validate">
							<div className="form-group">
								<label>Room Name</label>
								<input type="text" className="form-control" placeholder="Victory Room" name="name" onChange={handleChange} />
							</div>
						</form>					
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleClose}>
							Cancel
						</Button>
						<Button variant="primary" onClick={handleSubmit}>
							Create
						</Button>
					</Modal.Footer>	
				</div>
			</div>
			
		</Modal>
	)
}

export default CreateRoomModal;