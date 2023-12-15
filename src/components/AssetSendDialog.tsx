import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { SingleAssetDataResponse } from "../core/types";
import { toast } from "react-toastify";
import { isValidAddress } from "algosdk";
import {
  createAssetTransferTransactions,
  getWalletAddressFromNFDomain,
  sendSignedTransaction,
} from "../core/utils";

interface AssetSendDialogProps {
  open: boolean;
  balance: number;
  onClose: () => void;
  asset: SingleAssetDataResponse;
}

const AssetSendDialog: React.FC<AssetSendDialogProps> = ({
  open,
  onClose,
  asset,
  balance,
}) => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      if (!amount || !receiver) {
        toast.info("Please fill all fields");
        return;
      }
      if (Number(amount) <= 0) {
        toast.info("Amount must be greater than 0");
        return;
      }
      if (Number(amount) > balance / 10 ** asset.params.decimals) {
        toast.info("Insufficient balance");
        return;
      }
      let walletAddress = receiver.trim();
      setLoading(true);
      if (walletAddress.toLowerCase().includes(".algo")) {
        const response = await getWalletAddressFromNFDomain(
          walletAddress.toLowerCase()
        );
        if (isValidAddress(response)) {
          walletAddress = response;
        } else {
          toast.error("Invalid receiver address!");
          setLoading(false);
          return;
        }
      } else if (!isValidAddress(walletAddress)) {
        toast.error("Invalid receiver address!");
        setLoading(false);
        return;
      }
      const signedTxn = await createAssetTransferTransactions([
        {
          amount: Number(amount),
          receiver: walletAddress,
          decimals: asset.params.decimals,
          index: asset.index,
        },
      ]);
      await toast.promise(sendSignedTransaction(signedTxn), {
        pending: "Sending transaction...",
        success: "Transaction sent successfully!",
      });
      setAmount("");
      setReceiver("");
      onClose();
    } catch (error: any) {
      toast.error(
        error.message.split("TransactionPool.Remember:")[1] ||
          error.message ||
          "Something went wrong"
      );
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="text-center max-w-md">
        {asset.params.name} - {asset.index}
      </DialogTitle>
      <DialogContent className="flex flex-col">
        <div className="flex justify-center items-center">
          <TextField
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            variant="filled"
            placeholder={`Balance: ${balance / 10 ** asset.params.decimals}`}
          />
          <button
            className="ml-2"
            onClick={() =>
              setAmount((balance / 10 ** asset.params.decimals).toString())
            }
          >
            Max
          </button>
        </div>
        <TextField
          label="Receiver"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          margin="dense"
          variant="filled"
          placeholder="algo or .algo address"
        />
      </DialogContent>
      <DialogActions className="flex justify-center">
        <Button
          variant="text"
          color="primary"
          onClick={() => {
            setAmount("");
            setReceiver("");
            onClose();
          }}
        >
          Close
        </Button>
        <Button
          onClick={handleSend}
          variant="text"
          color="success"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetSendDialog;
