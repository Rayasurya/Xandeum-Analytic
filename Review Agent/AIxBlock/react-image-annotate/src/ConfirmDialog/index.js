import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export const ConfirmDialog = ({
  title = "Confirmation",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  open,
  onConfirm,
  onCancel,
  children,
  maxWidth = "xs",
  ...props
}) => {
  return (
    <Dialog open={open} {...props}>
      <DialogTitle component="div">{ title }</DialogTitle>
      <DialogContent dividers>{ children }</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => onCancel?.()} variant="contained" color="error">{ cancelLabel }</Button>
        <Button onClick={() => onConfirm?.()} variant="contained" color="success">{ confirmLabel }</Button>
      </DialogActions>
    </Dialog>
  );
}
