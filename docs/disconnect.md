# How to disconnect from DoubleZero - for testnet Users

## Prerequisites
- A Solana account for use with DoubleZero, with a balance of at least 1 SOL
- Access to the keypair used to create the connection
- The `doublezero` client installed on a Linux host

## Steps
### 1. Identify the connection you want to disconnect

Find the client IP used to create the connection.

For example:

```
doublezero user list | grep <client_ip>
```

Output:
```
$ doublezero user list | grep 64.130.58.6
 A1EmJjPxVBmwjh4WvSzCFe1bBYFbBa7p2cZYRSZD3SAE | server    | la2-dz01  | GREOverDIA | 64.130.58.6    | 501       | 169.254.0.16/31 | 207.45.216.138 | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan
```

### 2. End the contract

It is typical to disconnect from DoubleZero from the host on which you connected.  However, you may also disconnect a connection to DoubleZero from any computer with access to the keypair that created the connection.  This is sometimes useful if you abandoned the original host and forgot to disconnect.

For example:

```
doublezero disconnect --client-ip <client_ip>
```

Output:
```
$ doublezero disconnect --client-ip 64.130.58.6
DoubleZero Service Provisioning
🔍  Decommissioning User
\  deleting user account...
🔍  Deleting User Account for: A1EmJjPxVBmwjh4WvSzCFe1bBYFbBa7p2cZYRSZD3SAE
/  🔍  User Account deleted
🔍  Deprovisioning User
```

### 3. Disable `doublezerod` (optional)

Ending the smart contract does not stop `doublezerod`.  If you want to disable `doublezerod` but not remove the package, disable it with `systemctl` as follows:

```
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```