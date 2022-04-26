/* eslint-disable */
import React from 'react';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    getTokenCandidates,
} from '../api/helpers';

import { useDispatch } from 'react-redux';
import { setAutoComplete } from '../../../actions/main';

const Web3 = require("web3");
const web3 = new Web3("https://bsc-dataseed.binance.org/");

// Custom auto-complete component.
function Autocomplete(props) {
    const dispatch = useDispatch();
    const handleChange = props.onChange;
    const [searchText, setSearchText] = useState(() => '');
    const [completeElements, setCompleteElements] = useState(() => []);
    const autoCompleteOpened = useSelector(state => state.main.autoCompleteOpened);

    // hide the auto-complete list according to the redux state parameter
    useEffect(() => {
        if(!autoCompleteOpened) {
            setCompleteElements([]);
        }
    }, [autoCompleteOpened]);

    // When the string of search box changes, this function sends request to the api server and gets data for auto-complete list and sets it to the state for displaying.
    const handleSearchChange = async (e) => {
        handleChange(e.target.value);
		setSearchText(e.target.value);
        if(e.target.value.length > 2) {
            let cands = await getTokenCandidates(e.target.value);
            let fillContentWithImg = [];
            let fillContentWithoutImg = [];

            for(let i=0; i<cands.length; i++) {
                if(cands[i].image !== '') {
                    fillContentWithImg.push({
                        text: `${cands[i].symbol}(${cands[i].name})`,
                        address: `${cands[i].address}`,
                        value: cands[i].address,
                        image: cands[i].image,
                    });
                } else {
                    fillContentWithoutImg.push({
                        text: `${cands[i].symbol}(${cands[i].name})`,
                        address: `${cands[i].address}`,
                        value: cands[i].address,
                        image: '',
                    });
                }
            }
            setCompleteElements([...fillContentWithImg, ...fillContentWithoutImg]);
            dispatch(setAutoComplete(true));
        } else {
            dispatch(setAutoComplete(false));
        }
	}

    //. function that triggers when you click a row in auto-complete box.
    const handleSelect = (e) => {
        let ele = e.target;
        while(true) {
            if(ele.tagName === "P") {
                break;
            }
            ele = ele.parentElement;
        }
        handleChange(ele.getAttribute('value'), true);
		setSearchText(ele.getAttribute('value'));
    }

    return (
        <div className="position-relative">
            <input type="text" 
                className="form-control" 
                style={{borderColor: '#363C4E'}} 
                placeholder="Please input your token name or address." 
                onChange={handleSearchChange}
                value={searchText}
            />
            {completeElements.length > 0 ?
                <div className="auto-complete-container">
                    {
                        completeElements.map((ele, index) => {
                            return (
                                <p key={index} value={ele.value} onClick={handleSelect}>
                                    <span className="d-block">
                                        {ele.image ? 
                                        <img src={ele.image} height='30px' style={{paddingRight: '5px'}} />
                                        : <span style={{width: '30px'}}></span>}
                                        {ele.text}
                                    </span>
                                    <span style={{paddingLeft: '30px', fontSize: '12px'}}>{ele.address}</span>
                                </p>
                            )
                        })
                    }
                </div>
            : ''}
        </div>
    )
}

export default Autocomplete;