// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Donation {
    struct DonationStruct {
        uint id;
        address donateur;
        uint montant;
        uint timestamp;
    }

    event DonationCreated(uint id, address donateur, uint montant, uint timestamp);

    mapping(uint => DonationStruct) public donations;
    mapping(address => uint[]) public donateurToDonations;
    uint public donationCount;

    function createDonation() public payable {
        require(msg.value > 0, "Le montant de la donation doit être supérieur à 0");

        donationCount++;
        donations[donationCount] = DonationStruct(donationCount, msg.sender, msg.value, now);
        donateurToDonations[msg.sender].push(donationCount);

        emit DonationCreated(donationCount, msg.sender, msg.value, now);
    }

    function getDonation(uint _id) public view returns (uint, address, uint, uint) {
        DonationStruct storage donation = donations[_id];
        return (donation.id, donation.donateur, donation.montant, donation.timestamp);
    }

    function getDonationsByDonateur(address _donateur) public view returns (uint[] memory) {
        return donateurToDonations[_donateur];
    }
}
