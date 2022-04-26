import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Modal,
	Button,
} from 'react-bootstrap';

import { toggleApproveModal } from '../../../actions/room';
import { SOCKET } from '../../../apiConfig';

const ApproveModal = (props) => {
	const dispatch = useDispatch();
	const { data } = props;
	const showModal = useSelector(state => state.room.approveModalShow);

	const handleClose = () => {
		SOCKET.emit('REJECT_JOIN', data);
		dispatch(toggleApproveModal(false));
	}
	
	const handleSubmit = () => {
		SOCKET.emit('APPROVE_JOIN', data);
		dispatch(toggleApproveModal(false));
	}

	if (data) {
		return (
			<Modal show={showModal} onHide={handleClose} backdrop="static">
				<div className="card m-0">
					<div className="card-body">
						<Modal.Header closeButton>
							<Modal.Title>Approve to join</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							{`${data.user.name} wants to join to your room.`}	
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleClose}>
								Reject
							</Button>
							<Button variant="primary" onClick={handleSubmit}>
								Approve
							</Button>
						</Modal.Footer>	
					</div>
				</div>
			</Modal>
		)
	} else {
		return (
			<></>
		)
	}
	
}

export default ApproveModal;