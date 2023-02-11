// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./AggregatorV3Interface.sol";

/// @title Bibs NFTs 721 collection
/// @author cd33
contract BibsERC721 is ERC721, ERC2981, Ownable {
    using Strings for uint256;

    using SafeERC20 for IERC20;
    IERC20 private immutable usdt;
    address private constant recipient =
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // Second address hardhat
    AggregatorV3Interface internal constant priceFeed =
        AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e); // ETH/USD Goerli Testnet

    enum Step {
        Before,
        WhitelistSale,
        PublicSale
    }
    Step public sellingStep;

    uint8 public constant whitelistLimitBalance = 3;
    uint16 public constant MAX_SUPPLY = 5000;
    uint256 public whitelistSalePrice = 50;
    uint256 public publicSalePrice = 150;
    uint256 public nextNFT;

    string public baseURI;

    bytes32 private merkleRoot;

    // To avoid a buyer transferring his NFT to another wallet and buying again.
    mapping(address => uint8) public amountWhitelistSaleNftPerWallet;

    event StepChanged(uint8 step);

    constructor(
        bytes32 _merkleRoot,
        string memory _baseURI,
        address _address
    ) ERC721("Bibs721", "BIBS") {
        merkleRoot = _merkleRoot;
        baseURI = _baseURI;
        _setDefaultRoyalty(address(this), 700);
        usdt = IERC20(_address);
    }

    /**
     * @notice Enables only externally owned accounts (= users) to mint.
     */
    modifier callerIsUser() {
        require(tx.origin == msg.sender, "Caller is a contract");
        _;
    }

    function setStep(uint8 _step) external onlyOwner {
        sellingStep = Step(_step);
        emit StepChanged(_step);
    }

    function setWhitelistSalePrice(
        uint256 _newWhitelistSalePrice
    ) external onlyOwner {
        whitelistSalePrice = _newWhitelistSalePrice;
    }

    function setPublicSalePrice(
        uint256 _newPublicSalePrice
    ) external onlyOwner {
        publicSalePrice = _newPublicSalePrice;
    }

    function setBaseUri(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    /**
     * @notice Change the token's metadatas URI, override for OpenSea traits compatibility.
     * @param _tokenId Id of the token.
     * @return string Token's metadatas URI.
     */
    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "NFT doesn't exist");
        return
            bytes(baseURI).length > 0
                ? string(
                    abi.encodePacked(baseURI, _tokenId.toString(), ".json")
                )
                : "";
    }

    function getLatestPrice() public view returns (int256) {
        // (, int256 price, , , ) = priceFeed.latestRoundData();
        // return price;
        return 162150000000; // only for the tests
    }

    function _acceptPayment(uint256 _tokenamount) private {
        usdt.safeTransferFrom(msg.sender, recipient, _tokenamount);
    }

    // MINT
    function whitelistSaleMint(
        uint8 _quantity,
        bytes32[] calldata _proof
    ) external payable callerIsUser {
        require(sellingStep == Step.WhitelistSale, "Whitelist sale not active");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(nextNFT + _quantity <= MAX_SUPPLY, "Sold out");
        require(_isWhiteListed(msg.sender, _proof), "Not whitelisted");
        require(
            amountWhitelistSaleNftPerWallet[msg.sender] + _quantity <=
                whitelistLimitBalance,
            "Limited number per wallet"
        );
        require(
            msg.value >=
                (_quantity * whitelistSalePrice * 10 ** 26) /
                    uint256(getLatestPrice()),
            "Not enough funds"
        );
        payable(recipient).transfer(address(this).balance);
        amountWhitelistSaleNftPerWallet[msg.sender] += _quantity;
        uint256 currentNFT = nextNFT;
        nextNFT += _quantity;
        for (uint256 i = 1; i <= _quantity; ++i) {
            _safeMint(msg.sender, currentNFT + i);
        }
    }

    function whitelistSaleMintUSDT(
        uint8 _quantity,
        bytes32[] calldata _proof
    ) external payable callerIsUser {
        require(sellingStep == Step.WhitelistSale, "Whitelist sale not active");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(nextNFT + _quantity <= MAX_SUPPLY, "Sold out");
        require(_isWhiteListed(msg.sender, _proof), "Not whitelisted");
        require(
            amountWhitelistSaleNftPerWallet[msg.sender] + _quantity <=
                whitelistLimitBalance,
            "Limited number per wallet"
        );
        _acceptPayment(_quantity * whitelistSalePrice * 10 ** 6); // attention aux décimals USDT = 6 sur Ethereum
        amountWhitelistSaleNftPerWallet[msg.sender] += _quantity;
        uint256 currentNFT = nextNFT;
        nextNFT += _quantity;
        for (uint256 i = 1; i <= _quantity; ++i) {
            _safeMint(msg.sender, currentNFT + i);
        }
    }

    function publicSaleMint(uint256 _quantity) external payable callerIsUser {
        require(sellingStep == Step.PublicSale, "Public sale not active");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(nextNFT + _quantity <= MAX_SUPPLY, "Sold out");
        require(
            msg.value >=
                (_quantity * publicSalePrice * 10 ** 26) /
                    uint256(getLatestPrice()),
            "Not enough funds"
        );
        payable(recipient).transfer(address(this).balance);
        uint256 currentNFT = nextNFT;
        nextNFT += _quantity;
        for (uint256 i = 1; i <= _quantity; ++i) {
            _safeMint(msg.sender, currentNFT + i);
        }
    }

    function publicSaleMintUSDT(
        uint256 _quantity
    ) external payable callerIsUser {
        require(sellingStep == Step.PublicSale, "Public sale not active");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(nextNFT + _quantity <= MAX_SUPPLY, "Sold out");
        _acceptPayment(_quantity * publicSalePrice * 10 ** 6); // attention aux décimals USDT = 6 sur Ethereum
        uint256 currentNFT = nextNFT;
        nextNFT += _quantity;
        for (uint256 i = 1; i <= _quantity; ++i) {
            _safeMint(msg.sender, currentNFT + i);
        }
    }

    function gift(address _to, uint256 _quantity) external onlyOwner {
        require(_to != address(0), "Zero address");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(nextNFT + _quantity <= MAX_SUPPLY, "Sold out");
        uint256 currentNFT = nextNFT;
        nextNFT += _quantity;
        for (uint256 i = 1; i <= _quantity; ++i) {
            _safeMint(_to, currentNFT + i);
        }
    }

    // WHITELIST
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function _isWhiteListed(
        address _account,
        bytes32[] calldata _proof
    ) private view returns (bool) {
        return _verify(_leafHash(_account), _proof);
    }

    function _leafHash(address _account) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(_account));
    }

    function _verify(
        bytes32 _leaf,
        bytes32[] memory _proof
    ) private view returns (bool) {
        return MerkleProof.verify(_proof, merkleRoot, _leaf);
    }

    // ROYALTIES
    /**
     * @notice EIP2981 set royalties.
     * @dev Changes the receiver and the percentage of the royalties.
     * @param _receiver Address of receiver.
     * @param _feeNumerator Percentage of royalty.
     **/
    function setDefaultRoyalty(
        address _receiver,
        uint96 _feeNumerator
    ) external onlyOwner {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    }

    /**
     * @notice Returns true if this contract implements the interface IERC2981.
     * @param interfaceId Id of the interface.
     * @return bool Implements IERC2981 or not.
     **/
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Not allowing receiving ether outside minting functions
     */
    receive() external payable {
        revert("Only if you mint");
    }
}
