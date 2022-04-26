/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import Header2 from '../layout/header2';
import Sidebar from '../layout/sidebar';

import { withdrawCreditForGame, depositeFromWin, depositeFromCancel } from '../../actions/user';
import { addRoomLink } from '../../actions/room';
import { SOCKET } from '../../apiConfig';

const defaultScore = {
	player1: 0,
	player2: 0,
}

const Dice = () => {
	const dispatch = useDispatch();
	const { roomName } = useParams();
	const user = useSelector(state => state.user.user);
	const [room, setRoom] = useState(() => null);
	const [processingCredit, setProcessingCredit] = useState(() => 0);
	const [opposite, setOpposite] = useState(() => null);

	const [score, setScore] = useState(() => defaultScore);

	useEffect(() => {
		SOCKET.on('GET_ROOM', room => {
			setRoom(room);
			// dispatch(addRoomLink(room.name));
		});
	}, [roomName, dispatch]);

	useEffect(() => {
		if (user.email) {
			SOCKET.emit('USER_RECONNECT', {
				email: user.email,
				socket: SOCKET.id,
			});
			if (!room)
				SOCKET.emit('GET_ROOM', roomName);
		}
		if (user.email && room) {
			SOCKET.once('THROW_RESULT', data => {
				if (user.email === room.user.email) {
					award(data.creator, data.joiner);
					setScore({
						player1: data.creator,
						player2: data.joiner,
					});
				} else {
					award(data.joiner, data.creator);
					setScore({
						player1: data.joiner,
						player2: data.creator,
					});
				}
			});

			if (user.email === room.user.email) {
				if (room.user.ready) {
					setProcessingCredit(10);
				} else {
					setProcessingCredit(0);
				}
				setOpposite(room.joinedTo);
			} else {
				if (room.joinedTo.ready) {
					setProcessingCredit(10);
				} else {
					setProcessingCredit(0);
				}
				setOpposite(room.user);
			}
		}
	}, [user, room]);

	useEffect(() => {
		// if (processingCredit === 10 && opposite && opposite.ready) {
		// 	setTimeout(() => {
		// 		if (user.email === room.user.email) {
		// 			throwDice();
		// 		}
		// 	}, 1000);
		// }
	}, [processingCredit, opposite]);

	const throwDice = () => {
		setScore(defaultScore);
		SOCKET.emit('THROW', room.name);
	}

	const makeReady = useCallback(async () => {
		let res = await dispatch(withdrawCreditForGame({userId: user._id}));
		if (res) {
			SOCKET.emit('PLAYER_READY', {
				name: room.name,
				player: user.email,
			});
		}
	}, [user, room]);

	const cancelReady = useCallback(async () => {
		let res = await dispatch(depositeFromCancel({userId: user._id}));
		if (res) {
			SOCKET.emit('PLAYER_READY_CANCEL', {
				name: room.name,
				player: user.email,
			});
		}
	}, [user, room]);

	const award = (n1, n2) => {
		if (n1 > n2) {
			dispatch(depositeFromWin({userId: user._id}));
		}
		SOCKET.emit('INIT_READY', room.name);
	}

	return (
		<>
			<Header2 />
			<Sidebar />
			{ opposite ?
				<div className="content-body">
					<div className="container">
						<div className="row">
							<div className="col-12">
								<h6>Total credits: {user.credits}</h6>
							</div>
							<div className="col-12">
								<h6>Game credits: {processingCredit}</h6>
							</div>
							<div className="col-12">
							{ processingCredit === 0 ?
								<Button onClick={makeReady} >Ready</Button> :
								<Button className="btn btn-danger" onClick={cancelReady} >Cancel Ready</Button>
							}
							</div>
							<div className="col-12">
								<h6>Oposit player name: {opposite.name}</h6>
							</div>
							<div className="col-12">
								<h6>Oposit player status: {opposite.ready ? 'Ready' : 'Preparing'}</h6>
							</div>
						</div>
						<div className="row">
							{score.player1>0 && score.player2>0 ?
								<>
									<div className="col-xl-6 col-lg-6 col-md-6 col-12">
										<p>{user.name}</p>
										<img src={`/platform/assets/images/dice/dice${score.player1}.png`} alt="p1" />
									</div>
							
									<div className="col-xl-6 col-lg-6 col-md-6 col-12">
										<p>{opposite.name}</p>
										<img src={`/platform/assets/images/dice/dice${score.player2}.png`} alt="p2" />
									</div>
								</> : ''}
						</div>
					</div>
				</div> : ''
			}
		</>
	)
}

export default Dice;