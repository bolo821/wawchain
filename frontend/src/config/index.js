import SWAP_ABI from "./swap_abi.json";
import BALANCE_ABI from './balance_abi.json';
import APPROVE_ABI from './approve_abi.json';

const data = {
    SWAP: {
        address: "0xDF1A1b60f2D438842916C0aDc43748768353EC25",
        abi: SWAP_ABI,
    },
    BALANCE: {
        abi: BALANCE_ABI,
    },
    APPROVE: {
        abi: APPROVE_ABI,
    }
};

export default data;