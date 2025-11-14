// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XFriendsFinder
 * @notice Smart contract for managing paid queries to find X friends on Farcaster
 * @dev First query is free, subsequent queries require USDC payment
 */
contract XFriendsFinder is Ownable {
    IERC20 public usdcToken;
    uint256 public constant PRICE = 1_000_000; // $1 USDC (6 decimals)

    // Track query count per user
    mapping(address => uint256) public userQueryCount;

    // Events
    event PaymentReceived(address indexed user, uint256 amount, uint256 timestamp);
    event QueryExecuted(address indexed user, uint256 queryNumber);

    /**
     * @notice Constructor to initialize the contract
     * @param _usdcAddress Address of USDC token on Base
     */
    constructor(address _usdcAddress) Ownable(msg.sender) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdcToken = IERC20(_usdcAddress);
    }

    /**
     * @notice Check if user needs to pay for query
     * @param user Address of the user
     * @return needsPayment True if payment is required
     * @return queryCount Current number of queries made by user
     */
    function canQuery(address user) public view returns (bool needsPayment, uint256 queryCount) {
        queryCount = userQueryCount[user];
        needsPayment = queryCount > 0; // First query is free, subsequent queries require payment
        return (needsPayment, queryCount);
    }

    /**
     * @notice Execute a paid query (requires USDC payment for non-first queries)
     * @return queryNumber The query number for this user
     */
    function payAndQuery() external returns (uint256 queryNumber) {
        uint256 currentCount = userQueryCount[msg.sender];

        // If not first query, payment is required
        if (currentCount > 0) {
            require(
                usdcToken.transferFrom(msg.sender, owner(), PRICE),
                "Payment failed"
            );
            emit PaymentReceived(msg.sender, PRICE, block.timestamp);
        }

        // Increment query count
        userQueryCount[msg.sender]++;
        queryNumber = userQueryCount[msg.sender];

        emit QueryExecuted(msg.sender, queryNumber);
        return queryNumber;
    }

    /**
     * @notice Execute free query (only available for first query)
     * @return queryNumber The query number for this user
     */
    function freeQuery() external returns (uint256 queryNumber) {
        require(userQueryCount[msg.sender] == 0, "Free query already used");

        userQueryCount[msg.sender]++;
        queryNumber = userQueryCount[msg.sender];

        emit QueryExecuted(msg.sender, queryNumber);
        return queryNumber;
    }

    /**
     * @notice Emergency withdrawal function (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(usdcToken.transfer(owner(), balance), "Withdrawal failed");
    }

    /**
     * @notice Update USDC token address (owner only)
     * @param _newUsdcAddress New USDC token address
     */
    function updateUsdcAddress(address _newUsdcAddress) external onlyOwner {
        require(_newUsdcAddress != address(0), "Invalid USDC address");
        usdcToken = IERC20(_newUsdcAddress);
    }
}
