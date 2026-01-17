import { Injectable,
  InternalServerErrorException,
  ServiceUnavailableException, 
} from "@nestjs/common";
import { createPublicClient, http, PublicClient } from "viem";
import { avalancheFuji } from "viem/chains";
import  SIMPLE_STORAGE  from "./simple-storage.json";

@Injectable()
export class BlockchainService {
  private client: PublicClient;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
    });

    // GANTI dengan address hasil deploy Day 2
    this.contractAddress = "0x1e1be66d619aaa0b3e440f8abf06790872008f93" as `0x${string}`;
  }

  // 🔹 Read latest value
  async getLatestValue() {
    try {
      const value = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE.abi,
        functionName: "getValue",
      }) as bigint;

      return {
        value: value.toString(),
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Read ValueUpdated events
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    try {
      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: "event",
          name: "ValueUpdated",
          inputs: [
            {
              name: "newValue",
              type: "uint256",
              indexed: false,
            },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      return events.map((event: any) => ({
        blockNumber: event.blockNumber?.toString(),
        value: event.args.newValue?.toString(),
        txHash: event.transactionHash,
      }));
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Centralized RPC Error Handler
  private handleRpcError(error: unknown): never {

    const message = error instanceof Error ? error.message : String(error);
    console.log({error: message});


    if (message.includes("timeout")) {
      throw new ServiceUnavailableException(
        "RPC timeout. Silakan coba beberapa saat lagi."
      );
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed")
    ) {
      throw new ServiceUnavailableException(
        "Tidak dapat terhubung ke blockchain RPC."
      );
    }

    throw new InternalServerErrorException(
      "Terjadi kesalahan saat membaca data blockchain."
    );
  }
}