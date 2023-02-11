import type { NextPage } from "next";
import Head from "next/head";
import useEthersProvider from "../context/useEthersProvider";
import { useAccount } from "wagmi";

const Home: NextPage = () => {
  const { contractFakeUSDT, contract721Address, owner } = useEthersProvider();
  const { address, isConnected } = useAccount();

  return (
    <div className="mb-auto min-h-screen">
      <Head>
        <title>Starter Kit</title>
        <meta name="Carlito" content="Carlito starter kit" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isConnected ? (
        <div className="text-center">
          <p className="text-2xl my-12">Home</p>
          <p className="text-base">Your Address : {address}</p>
          <p className="text-base">contractFakeUSDT : {contractFakeUSDT}</p>
          <p className="text-base">contract721Address : {contract721Address}</p>
          <p className="text-base">owner : {owner}</p>
        </div>
      ) : (
        <p className="text-base">Please connect your wallet</p>
      )}
    </div>
  );
};

export default Home;
