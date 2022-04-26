import * as React from "react";
import { ellipseAddress, getChainData } from "../helpers/utilities";
import Button from "react-bootstrap/Button";

const Header = (props) => {
  const { connected, address, chainId, killSession, balance } = props;
  const chainData = chainId ? getChainData(chainId) : null;
  return (
    <div className="col-xl-6 col-lg-6 col-12">
      {connected && chainData ? (
        <div>
          <h1 className="mb-0">{`Connected to`}</h1>
          <p>{chainData.name}</p>
        </div>
      ) : (
        <div>
        </div>
      )}
      {address && (
        <div className="mt-5">
          <h4>Your wallet address is:</h4>
          <p className="mb-0">{address}</p>
          <p className="mb-0">{ellipseAddress(address)}</p>
          <p className="mb-0">{'Token Amount(SAFEMARS): ' + balance}</p>
          {connected?
          <Button variant="primary" className="mt-4" onClick={killSession}>
            {"Disconnect"}
          </Button>
          : ''}
        </div>
      )}
    </div>
  );
};

export default Header;
