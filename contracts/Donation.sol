// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Donation {
    uint256 public totalDonations;

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalDonations += msg.value;
    }

    function getTotalDonations() public view returns (uint256) {
        return totalDonations;
    }
}
