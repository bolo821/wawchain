import React, { useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import { useDispatch } from 'react-redux';

import { resetPassword } from '../../actions/user';
import { setMessage } from '../../actions/message';

const initFormData = {
    password: '',
    confirmPassword: '',
}

function ResetPassword() {
    const dispatch = useDispatch();
    const history = useHistory();
    const { userId } = useParams();
    const [form, setForm] = useState(() => initFormData);

    const handleChange = (e) => {
        let key = e.target.name;
        let value = e.target.value;
        switch(key) {
            case 'password': {
                setForm({
                    ...form,
                    password: value,
                });
                break;
            }
            case 'confirmPassword': {
                setForm({
                    ...form,
                    confirmPassword: value,
                });
                break;
            }
            default: {
                break;
            }
        }
    }

    const validateForm = () => {
        return  form.password !== '' &&
                form.confirmPassword !== '' &&
                form.password === form.confirmPassword
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(validateForm()) {
            dispatch(resetPassword({...form, userId: userId}, history));
        } else {
            dispatch(setMessage({
                display: true,
                message: 'Please fill in all fields with valid values.',
            }));
        }
    }

    return (
        <>
            <div className="authincation">
                <div className="container h-100">
                    <div className="row justify-content-center h-100 align-items-center">
                        <div className="col-xl-5 col-md-6">
                            <div className="mini-logo text-center my-3">
                                <Link to={"./"}><img src={require("../../images/logo.png")} alt="" /></Link>
                            </div>
                            <div className="auth-form card">
                                <div className="card-header justify-content-center">
                                    <h4 className="card-title">Reset Password</h4>
                                </div>
                                <div className="card-body">
                                    <form method="post" name="myform" className="signin_validate">
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input type="password" className="form-control" placeholder="Password" name="password"
                                                onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm Password</label>
                                            <input type="password" className="form-control" placeholder="Confirm Password" name="confirmPassword"
                                                onChange={handleChange} />
                                        </div>
                                        <div className="text-center mt-4">
                                            <Button className="btn btn-success btn-block" onClick={handleSubmit}>Reset Password</Button>
                                        </div>
                                    </form>
                                    <div className="new-account mt-3">
                                        <p>Already have an account? <Link className="text-primary" to="/signin">Sign in</Link></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ResetPassword;