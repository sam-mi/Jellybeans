pragma solidity ^0.4.24;

contract JellybeanGame {

    /*
    The Jellybean Game

    Guess the correct value of Jellybeans in the Jar
    in order to win the pot of guesses.

    This follows the Solidity by example BlindedAuction
    http://solidity.readthedocs.io/en/v0.4.21/solidity-by-example.html
    */
    bytes32 private hashedAnswer; // encrypted answer, how?
    uint public entryCost;
    bool public ended;
    uint public gameEnd; // Time the game ends
    address public beneficiary; // Address of beneficiary
    address public developer; // Address of developer

    // Store the best guess and their address
    uint public closestGuess;
    address public closestGuessAddress;

    // Allowed withdrawals of previous guesses
    mapping(address => uint) pendingReturns;

    event GameEnd(address winner, uint closestGuess);

    // A Guess is an entry in the Game
    struct Guess {
        bytes32 guess; // the players hidden guess
        uint amount; // amount spent on bet
    }

    mapping(address => Guess) public guesses;

    // Image in IPFS
    mapping(address=>Image[]) private images;
    struct Image{
      string imageHash;
      string ipfsInfo;
    }
    function uploadImage(string hash, string ipfs) public{
       images[msg.sender].push(Image(hash,ipfs));
    }

    // hashing
    function getKeccak256() public view returns (uint256) {
        return uint256(keccak256("something"));
    }

    // bytes32 to string
    function bytes32ToString (bytes32 data) returns (string) {
        bytes memory bytesString = new bytes(32);
        for (uint j=0; j<32; j++) {
            byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[j] = char;
            }
        }
        return string(bytesString);
    }

    // uint to string (https://github.com/pipermerriam/ethereum-string-utils)
    function uintToBytes(uint v) constant returns (bytes32 ret) {
        if (v == 0) {
            ret = '0';
        }
        else {
            while (v > 0) {
                ret = bytes32(uint(ret) / (2 ** 8));
                ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
                v /= 10;
            }
        }
        return ret;
    }

    /// Modifiers are a convenient way to validate inputs to
    /// functions. `onlyBefore` is applied to `bid` below:
    /// The new function body is the modifier's body where
    /// `_` is replaced by the old function body.
    modifier onlyBefore(uint _time) { require(now < _time); _; }
    modifier onlyAfter(uint _time) { require(now > _time); _; }

    // Constructor - create Game on contract creation.
    function JellybeanGame(
        uint answer,
        uint _gameTime,
        uint _entryCost,
        address _beneficiary,
        string image_hash,
        string imageIPFSInfo
    ) public {
        beneficiary = _beneficiary;
        gameEnd = now + _gameTime;
        uploadImage(imageHash, imageIPFSInfo);

        // convert the answer to a string and hash
        bytes32 hashedAnswer = keccak256(uintToBytes(answer));
    }

    // Internal function for playing / placing a guess
    function play(address player, uint guess, uint amount)
        internal
        returns (bool success)
    {
//        if (guess <=)
        // if guess
    }


    /// Withdraw a bid that was overbid.
    function withdraw() public {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `transfer` returns (see the remark above about
            // conditions -> effects -> interaction).
            pendingReturns[msg.sender] = 0;

            msg.sender.transfer(amount);
        }
    }

    /// End the auction and send the closest
    /// to the beneficiary.
    function gameEnd()
        public
        onlyAfter(revealEnd)
    {
        require(!ended);
        emit GameEnded(closestBidder, closestGuess);
        ended = true;
        // TODO: if the bid is not exact, transfer 50% to closest beneficiary
        // and 50% to developers
        beneficiary.transfer(closestGuess);
    }
}

//contract CreateCompetition