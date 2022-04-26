import axios, { AxiosInstance } from 'axios'
import { IAssetData, IGasPrices, IParsedTx } from './types'

const CancelToken = axios.CancelToken;
var cancel:any = null;

const api: AxiosInstance = axios.create({
  baseURL: 'https://ethereum-api.xyz',
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  cancelToken: new CancelToken(function executor(c) {
    cancel = c;
  }),
})

export async function apiGetAccountAssets(
  address: string,
  chainId: number
): Promise<IAssetData[]> {
  const response = await api.get(
    `/account-assets?address=${address}&chainId=${chainId}`
  )
  const { result } = response.data
  return result
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: number
): Promise<IParsedTx[]> {
  const response = await api.get(
    `/account-transactions?address=${address}&chainId=${chainId}`
  )
  const { result } = response.data
  return result
}

export const apiGetAccountNonce = async (
  address: string,
  chainId: number
): Promise<string> => {
  const response = await api.get(
    `/account-nonce?address=${address}&chainId=${chainId}`
  )
  const { result } = response.data
  return result
}

export const apiGetGasPrices = async (): Promise<IGasPrices> => {
  const response = await api.get(`/gas-prices`)
  const { result } = response.data
  return result
}

export const cancelRequest = () => {
  cancel();
}