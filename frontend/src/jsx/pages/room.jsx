import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
	Button,
} from 'react-bootstrap';

import Header2 from '../layout/header2';
import Sidebar from '../layout/sidebar';
import CreateRoomModal from './components/CreateRoomModal';
import ApproveModal from './components/ApproveModal';

import { toggleCreateRoomModal, toggleApproveModal } from '../../actions/room';
import { setMessage } from '../../actions/message';
import { SOCKET } from '../../apiConfig';

const Room = () => {
	const dispatch = useDispatch();
	// const history = useHistory();
	const [rooms, setRooms] = useState(() => []);
	const user = useSelector(state => state.user.user);
	const [joiningInfo, setJoiningInfo] = useState(null);

	useEffect(() => {
		if(user.email) {
			SOCKET.emit('USER_RECONNECT', {
				email: user.email,
				socket: SOCKET.id,
			});
			SOCKET.emit('GET_ROOMS');
		}
		SOCKET.on('CURRENT_ROOMS', data => {
			setRooms(data);
		});
		SOCKET.on('REQUEST_JOIN', data => {
			setJoiningInfo(data);
			dispatch(toggleApproveModal(true));
		});
		SOCKET.on('REJECT_JOIN', data => {
			dispatch(setMessage({
				message: `${data.user.name} refused to join to the room "${data.name}".`,
				display: true,
			}));
		});
		SOCKET.on('APPROVE_JOIN', data => {
			dispatch(setMessage({
				message: `You have joined to room "${data.name}".`,
				display: true,
			}));
		});
		SOCKET.on('CANCEL_JOINING', () => {
			dispatch(toggleApproveModal(false));
		})
		// SOCKET.on('START_GAME', name => {
		// 	history.push(`/dice/${name}`);
		// });
	}, [dispatch, user]);

	const joinRoom = (name) => {
		SOCKET.emit('REQUEST_JOIN', {
			name: name,
			user: user,
			joiner: SOCKET.id,
		});
	}

	const removeRoom = (name) => {
		SOCKET.emit('REMOVE_ROOM', name);
	}

	const createRoom = (name) => {
		dispatch(toggleCreateRoomModal(true));
	}

	const cancelJoined = (name) => {
		SOCKET.emit('CANCEL_JOIN', name);
	}

	const cancelJoining = (name) => {
		SOCKET.emit('CANCEL_JOINING', name);
	}

	const makeCancelButton = (ele) => {
		switch (ele.status) {
			case 'Join' : {
				return (
					<td className="p-2">
						<Button className="btn btn-danger" disabled={true}>Cancel</Button>
					</td>
				)
			}
			case 'Joining' : {
				return (
					<td className="p-2">
						<Button className="btn btn-danger" onClick={() => cancelJoining(ele.name)}>Cancel</Button>
					</td>
				)
			}
			case 'Joined' : {
				return (
					<td className="p-2">
						<Button className="btn btn-danger" onClick={() => cancelJoined(ele.name)}>Cancel</Button>
					</td>
				)
			}
			default : {
				return ''
			}
		}
	}

	return (
		<>
			<Header2 />
			<Sidebar />
			<div className="content-body">
				<div className="container">
					<div className="row justify-content-center p-5">
						<Button className="room-create-bn-rt" onClick={createRoom}>Create a room</Button>
					</div>
					<div className="row">
						<div className="col-12">
							<div className="card">
								<div className="card-body">
									{ rooms.length > 0 ?
										<table className="table table-hover transaction-table">
											<thead>
												<tr>
													<th scope="col" className="p-2">Room Name</th>
													<th scope="col" className="p-2">Creater Name</th>
													<th scope="col" className="p-2">Join</th>
													<th scope="col" className="p-2">Cancel</th>
													<th scope="col" className="p-2">Play</th>
												</tr>
											</thead>
											<tbody>
												{rooms.map((ele, index) => {
													return (
														<tr key={index}>
															<td className="p-2">{ele.name}</td>
															<td className="p-2">{ele.user.name}</td>
															{ user.email === ele.user.email ?
																<td className="p-2">
																	<Button className="room-list-bn-rt" onClick={() => removeRoom(ele.name)}>
																		<span className="icon"><i class="fas fa-trash-alt"></i></span>
																		Remove
																	</Button>
																</td> :
																<td className="p-2">
																	<Button className="room-list-bn-rt" onClick={() => joinRoom(ele.name)} disabled={ele.status !== 'Join' ? true : false}>
																		{ ele.status }
																	</Button>
																</td>
															}
															{
																makeCancelButton(ele)
															}
															{ ele.user && ele.joinedTo ?
																<td className="p-2">
																	<Link className="btn btn-success" to={`/dice/${ele.name}`}>Play</Link>
																</td> : 
																<td className="p-2">Not joined</td>
															}
														</tr>
													)
												})}
											</tbody>
										</table> :
										<p className="m-0 w-100 text-center">There are no rooms created.</p>
									}
								</div>
							</div>					
						</div>
					</div>
				</div>
			</div>
			<CreateRoomModal />
			<ApproveModal data={joiningInfo} />
		</>
	)
}

export default Room;