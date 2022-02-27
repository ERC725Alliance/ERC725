const { assert, expect } = require("chai");
const { expectRevert } = require("openzeppelin-test-helpers");
const { web3 } = require("openzeppelin-test-helpers/src/setup");

const ERC725Y = artifacts.require("ERC725Y");
const ReaderContract = artifacts.require("Reader");

const ERC725YWriter = artifacts.require("ERC725YWriter");
const ERC725YReader = artifacts.require("ERC725YReader");

const { INTERFACE_ID } = require("../constants");

contract("ERC725Y (from EOA)", (accounts) => {
  const owner = accounts[1];
  const newOwner = accounts[2];
  const nonOwner = accounts[3];

  let account;

  before(async () => {
    account = await ERC725Y.new(owner, { from: owner });
  });

  context("ERC165", async () => {
    before(async () => {
      account = await ERC725Y.new(owner, { from: owner });
    });
    it("Supports ERC165", async () => {
      assert.isTrue(await account.supportsInterface.call(INTERFACE_ID.ERC165));
    });

    it("Supports ERC725Y", async () => {
      assert.isTrue(await account.supportsInterface.call(INTERFACE_ID.ERC725Y));
    });
  });

  context("Contract Ownership - (ERC173)", async () => {
    beforeEach(async () => {
      account = await ERC725Y.new(owner, { from: owner });
    });

    it("should have set the right owner", async () => {
      const accountOwner = await account.owner.call();
      assert.equal(accountOwner, owner, "Addresses should match");
    });

    it("should allow owner to transfer ownership", async () => {
      await account.transferOwnership(newOwner, { from: owner });
      const accountOwner = await account.owner.call();

      assert.equal(accountOwner, newOwner, "Addresses should match");
    });

    it("should revert when non-owner try to transfer ownership", async () => {
      await expectRevert(
        account.transferOwnership(newOwner, { from: nonOwner }),
        "Ownable: caller is not the owner"
      );
    });

    it("should allow owner to setData", async () => {
      const key = web3.utils.asciiToHex("Important Data");
      const value = web3.utils.asciiToHex("Important Data");

      await account.setData([key], [value], { from: owner });

      const [result] = await account.getData([key]);
      assert.equal(result, value);
    });

    it("should revert when non-owner try to set data", async () => {
      const key = [web3.utils.asciiToHex("Important Data")];
      const data = [web3.utils.asciiToHex("Important Data")];

      await expectRevert(
        account.setData(key, data, { from: nonOwner }),
        "Ownable: caller is not the owner"
      );
    });
  });

  context("writing 1 x key to storage from an EOA", async () => {
    const KEYS = {
      single_byte: web3.utils.soliditySha3("single byte"),
      small_bytes: web3.utils.soliditySha3("small bytes"),
      medium_bytes: web3.utils.soliditySha3("medium bytes"),
      long_bytes: web3.utils.soliditySha3("long bytes"),
    };

    context("when setting", async () => {
      it("should set a single byte value", async () => {
        let key = KEYS.single_byte;
        let value = "0x11";

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });

      it("should set a small byte value (= 10 bytes)", async () => {
        let key = KEYS.small_bytes;
        let value = "0x11111111111111111111";

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });

      it("should set a medium byte value (= an URL)", async () => {
        let key = KEYS.medium_bytes;
        let value = web3.utils.utf8ToHex(
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD"
        );
        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });

      it("should set a long bytes value (= a paragraph)", async () => {
        let key = KEYS.long_bytes;
        let value = web3.utils.utf8ToHex(
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        );

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });
    });

    context("when updating", async () => {
      it("should update a single byte value", async () => {
        let key = KEYS.single_byte;
        let value = "0x11";

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });

      it("should update a small byte value (= 10 bytes)", async () => {
        let key = KEYS.small_bytes;
        let value = "0x11111111111111111111";

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });

      it("should update a medium byte value (= an URL)", async () => {
        let key = KEYS.medium_bytes;
        let value = web3.utils.utf8ToHex(
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD"
        );
        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });

      it("should update a long bytes value (= a paragraph with 572 characters)", async () => {
        let key = KEYS.long_bytes;
        let value = web3.utils.utf8ToHex(
          "Donec vitae nisi dui. In fringilla aliquet lorem. Aenean mi ipsum, congue quis mauris vitae, bibendum vulputate odio. Morbi mollis leo quam, id malesuada magna luctus in. Curabitur purus diam, vehicula id vehicula id, ornare a justo. Duis auctor nibh a mauris vestibulum rutrum. Mauris in tortor varius, dictum quam quis, ultrices velit. Vivamus at commodo mauris, a egestas orci. Aenean porta porttitor orci vitae scelerisque. Phasellus lacus sem, interdum vel sodales a, placerat ac sem. Donec ut leo mollis, sodales nulla in, viverra risus. Proin eget hendrerite ipsum."
        );

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });
    });

    context("when deleting", async () => {
      it("should update a single byte value", async () => {
        let key = KEYS.single_byte;

        await account.setData([key], ["0x"], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, "0x");
      });

      it("should update a small byte value (= 10 bytes)", async () => {
        let key = KEYS.small_bytes;

        await account.setData([key], ["0x"], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, "0x");
      });

      it("should update a medium byte value (= an URL)", async () => {
        let key = KEYS.medium_bytes;

        await account.setData([key], ["0x"], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, "0x");
      });

      it("should update a long bytes value (= a paragraph with 572 characters)", async () => {
        let key = KEYS.long_bytes;

        await account.setData([key], ["0x"], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, "0x");
      });
    });
  });

  context("writing multiples keys to storage from an EOA", async () => {
    const KEYS = {
      same_length: [
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444444444444444444444444444",
        "0x5555555555555555555555555555555555555555555555555555555555555555",
      ],
      different_length: [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      ],
    };

    const VALUES = {
      same_length: [
        "0x1111111111",
        "0x2222222222",
        "0x3333333333",
        "0x4444444444",
        "0x5555555555",
      ],
      different_length: [
        "0xabcdef",
        "0x0123456789abcdef",
        "0xabcdefabcdefabcdef123456789123456789",
        "0xfeefefefefefeffbbbbcccccbb555576",
        "0xfe556551ffbbbbcccccbb55556",
      ],
    };

    it("should revert when keys.length !== values.length", async () => {
      let keys = [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      ];
      let values = [
        "0xabcdef",
        "0x0123456789abcdef",
        "0xabcdefabcdefabcdef123456789123456789",
        "0xabcdefabcdefabcdef123456789123456789",
      ];
      await expectRevert(
        account.setData(keys, values, { from: owner }),
        "Keys length not equal to values length"
      );
    });

    context("when setting", async () => {
      it("should set 5 x keys of same bytes value length", async () => {
        let keys = KEYS.same_length;
        let values = VALUES.same_length;

        await account.setData(keys, values, { from: owner });

        const result = await account.getData(keys);
        assert.deepEqual(result, values);
      });

      it("should set 5 x keys of different bytes value length", async () => {
        let keys = KEYS.different_length;
        let values = VALUES.different_length;

        await account.setData(keys, values, { from: owner });

        const result = await account.getData(keys);
        assert.deepEqual(result, values);
      });
    });

    context("when updating", async () => {
      it("should update 5 x keys of same bytes value length", async () => {
        let keys = KEYS.same_length;
        let values = [
          "0x111111aaaa",
          "0x222222bbbb",
          "0x333333cccc",
          "0x444444dddd",
          "0x555555eeee",
        ];
        await account.setData(keys, values, { from: owner });

        const result = await account.getData(keys);
        assert.deepEqual(result, values);
      });

      it("should update 5 x keys of different bytes value length", async () => {
        let keys = KEYS.different_length;
        let values = [
          "0xaaaaef",
          "0xbbbb456789abcdef",
          "0xccccefabcdefabcdef123456789123456789",
          "0xddddefefefefeffbbbbcccccbb555576",
          "0xeeee6551ffbbbbcccccbb55556",
        ];
        await account.setData(keys, values, { from: owner });

        const result = await account.getData(keys);
        assert.deepEqual(result, values);
      });
    });

    context("when deleting", async () => {
      it("should delete 5 x keys (where all bytes value length were the same)", async () => {
        let keys = KEYS.same_length;
        let values = ["0x", "0x", "0x", "0x", "0x"];
        await account.setData(keys, values, { from: owner });

        const result = await account.getData(keys);
        assert.deepEqual(result, values);
      });

      it("should delete 5 x keys (where each bytes value length were different)", async () => {
        let keys = KEYS.different_length;
        let values = ["0x", "0x", "0x", "0x", "0x"];
        await account.setData(keys, values, { from: owner });

        const result = await account.getData(keys);
        assert.deepEqual(result, values);
      });
    });
  });

  context("write to storage, 32 bytes words at a time", async () => {
    let byte = "11";

    for (let ii = 1; ii <= 384; ii += 31) {
      it(`should write ${ii} bytes in storage`, async () => {
        let value = "0x" + byte.repeat(ii);
        let key = web3.utils.soliditySha3(value);

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });
    }
  });

  context("update storage, 32 bytes word at a time", async () => {
    let byte = "11";
    let key = web3.utils.soliditySha3("same storage slot");

    before(async () => {
      await account.setData([key], ["0xaa"], { from: owner });
    });

    for (let ii = 1; ii <= 384; ii += 31) {
      it(`should write ${ii} bytes in storage`, async () => {
        let value = "0x" + byte.repeat(ii);

        await account.setData([key], [value], { from: owner });

        const [result] = await account.getData([key]);
        assert.equal(result, value);
      });
    }
  });

  context("write Solidity variable types as raw bytes", async () => {
    const KEY_FOR_BOOLEAN = web3.utils.soliditySha3("Key for boolean");
    const KEY_FOR_ADDRESS = web3.utils.soliditySha3("Key for address");
    const KEY_FOR_STRING = web3.utils.soliditySha3("Key for string");

    before(async () => {
      account = await ERC725Y.new(owner, { from: owner })
    });

    it("should write a `boolean` to storage", async () => {
      let key = KEY_FOR_BOOLEAN;
      let value = web3.eth.abi.encodeParameter('bool', true);

      await account.setData([key], [value], { from: owner });

      const [result] = await account.getData([key])
      assert.equal(result, value);
    });

    it("should write an `address` to storage", async () => {
      let key = KEY_FOR_ADDRESS;
      let value = web3.eth.abi.encodeParameter('address', accounts[5]);

      await account.setData([key], [value], { from: owner });

      const [result] = await account.getData([key])
      assert.equal(result, value);
    });

    it("should write a `string` to storage", async () => {
      let key = KEY_FOR_ADDRESS;
      let value = web3.eth.abi.encodeParameter('string', "This is a new string");

      await account.setData([key], [value], { from: owner });

      const [result] = await account.getData([key])
      assert.equal(result, value);
    });

    it("should update a `boolean` value in storage", async () => {
      let key = KEY_FOR_BOOLEAN;
      let value = web3.eth.abi.encodeParameter('bool', false);

      await account.setData([key], [value], { from: owner });

      const [result] = await account.getData([key])
      assert.equal(result, value);
    });

    it("should update an `address` value in storage", async () => {
      let key = KEY_FOR_ADDRESS;
      let value = web3.eth.abi.encodeParameter('address', accounts[6]);

      await account.setData([key], [value], { from: owner });

      const [result] = await account.getData([key])
      assert.equal(result, value);
    });

    it("should update a `string` value in storage", async () => {
      let key = KEY_FOR_ADDRESS;
      let value = web3.eth.abi.encodeParameter('string', "This is an updated string");

      await account.setData([key], [value], { from: owner });

      const [result] = await account.getData([key])
      assert.equal(result, value);
    });

    context("bytesN", async () => {

      let runs = [
        { 
          name: "bytes1", // to display on unit test
          key: web3.utils.soliditySha3("Key for bytes1"), 
          value: web3.eth.abi.encodeParameter('bytes1', '0x' + 'ff'.repeat(1) ) 
        },
        { 
          name: "bytes2",
          key: web3.utils.soliditySha3("Key for bytes2"), 
          value: web3.eth.abi.encodeParameter('bytes2', '0x' + 'ff'.repeat(2) ) 
        },
        { 
          name: "bytes3",
          key: web3.utils.soliditySha3("Key for bytes3"), 
          value: web3.eth.abi.encodeParameter('bytes3', '0x' + 'ff'.repeat(3) ) 
        },
        { 
          name: "bytes4",
          key: web3.utils.soliditySha3("Key for bytes4"), 
          value: web3.eth.abi.encodeParameter('bytes4', '0x' + 'ff'.repeat(4) ) 
        },
        { 
          name: "bytes5",
          key: web3.utils.soliditySha3("Key for bytes5"), 
          value: web3.eth.abi.encodeParameter('bytes5', '0x' + 'ff'.repeat(5) ) 
        },
        { 
          name: "bytes6",
          key: web3.utils.soliditySha3("Key for bytes6"), 
          value: web3.eth.abi.encodeParameter('bytes6',  '0x' + 'ff'.repeat(6) ) 
        },
        { 
          name: "bytes7",
          key: web3.utils.soliditySha3("Key for bytes7"), 
          value: web3.eth.abi.encodeParameter('bytes7',  '0x' + 'ff'.repeat(7) ) 
        },
        { 
          name: "bytes8",
          key: web3.utils.soliditySha3("Key for bytes8"), 
          value: web3.eth.abi.encodeParameter('bytes8',  '0x' + 'ff'.repeat(8) ) 
        },
        { 
          name: "bytes9",
          key: web3.utils.soliditySha3("Key for bytes9"), 
          value: web3.eth.abi.encodeParameter('bytes9',  '0x' + 'ff'.repeat(9) ) 
        },
        { 
          name: "bytes10",
          key: web3.utils.soliditySha3("Key for bytes10"), 
          value: web3.eth.abi.encodeParameter('bytes10',  '0x' + 'ff'.repeat(10) ) 
        },
        
        { 
          name: "bytes11",
          key: web3.utils.soliditySha3("Key for bytes11"), 
          value: web3.eth.abi.encodeParameter('bytes11', '0x' + 'ff'.repeat(11) ) 
        },
        { 
          name: "bytes12",
          key: web3.utils.soliditySha3("Key for bytes12"), 
          value: web3.eth.abi.encodeParameter('bytes12', '0x' + 'ff'.repeat(12) ) 
        },
        { 
          name: "bytes13",
          key: web3.utils.soliditySha3("Key for bytes13"), 
          value: web3.eth.abi.encodeParameter('bytes13', '0x' + 'ff'.repeat(13) ) 
        },
        { 
          name: "bytes14",
          key: web3.utils.soliditySha3("Key for bytes14"), 
          value: web3.eth.abi.encodeParameter('bytes14', '0x' + 'ff'.repeat(14) ) 
        },
        { 
          name: "bytes15",
          key: web3.utils.soliditySha3("Key for bytes15"), 
          value: web3.eth.abi.encodeParameter('bytes15', '0x' + 'ff'.repeat(15) ) 
        },
        { 
          name: "bytes16",
          key: web3.utils.soliditySha3("Key for bytes16"), 
          value: web3.eth.abi.encodeParameter('bytes16', '0x' + 'ff'.repeat(16) ) 
        },
        { 
          name: "bytes17",
          key: web3.utils.soliditySha3("Key for bytes17"), 
          value: web3.eth.abi.encodeParameter('bytes17', '0x' + 'ff'.repeat(17) ) 
        },
        { 
          name: "bytes18",
          key: web3.utils.soliditySha3("Key for bytes18"), 
          value: web3.eth.abi.encodeParameter('bytes18', '0x' + 'ff'.repeat(18) ) 
        },
        { 
          name: "bytes19",
          key: web3.utils.soliditySha3("Key for bytes19"), 
          value: web3.eth.abi.encodeParameter('bytes19', '0x' + 'ff'.repeat(19) ) 
        },
        { 
          name: "bytes20",
          key: web3.utils.soliditySha3("Key for bytes20"), 
          value: web3.eth.abi.encodeParameter('bytes20', '0x' + 'ff'.repeat(20) ) 
        },
        { 
          name: "bytes21",
          key: web3.utils.soliditySha3("Key for bytes21"), 
          value: web3.eth.abi.encodeParameter('bytes21', '0x' + 'ff'.repeat(21) ) 
        },
        { 
          name: "bytes22",
          key: web3.utils.soliditySha3("Key for bytes22"), 
          value: web3.eth.abi.encodeParameter('bytes22', '0x' + 'ff'.repeat(22) ) 
        },
        { 
          name: "bytes23",
          key: web3.utils.soliditySha3("Key for bytes23"), 
          value: web3.eth.abi.encodeParameter('bytes23', '0x' + 'ff'.repeat(23) ) 
        },
        { 
          name: "bytes24",
          key: web3.utils.soliditySha3("Key for bytes24"), 
          value: web3.eth.abi.encodeParameter('bytes24', '0x' + 'ff'.repeat(24) ) 
        },
        { 
          name: "bytes25",
          key: web3.utils.soliditySha3("Key for bytes25"), 
          value: web3.eth.abi.encodeParameter('bytes25', '0x' + 'ff'.repeat(25) ) 
        },
        { 
          name: "bytes26",
          key: web3.utils.soliditySha3("Key for bytes26"), 
          value: web3.eth.abi.encodeParameter('bytes26', '0x' + 'ff'.repeat(26) ) 
        },
        { 
          name: "bytes27",
          key: web3.utils.soliditySha3("Key for bytes27"), 
          value: web3.eth.abi.encodeParameter('bytes27', '0x' + 'ff'.repeat(27) ) 
        },
        { 
          name: "bytes28",
          key: web3.utils.soliditySha3("Key for bytes28"), 
          value: web3.eth.abi.encodeParameter('bytes28', '0x' + 'ff'.repeat(28) ) 
        },
        { 
          name: "bytes29",
          key: web3.utils.soliditySha3("Key for bytes29"), 
          value: web3.eth.abi.encodeParameter('bytes29', '0x' + 'ff'.repeat(29) ) 
        },
        { 
          name: "bytes30",
          key: web3.utils.soliditySha3("Key for bytes30"), 
          value: web3.eth.abi.encodeParameter('bytes30', '0x' + 'ff'.repeat(30) ) 
        },
        { 
          name: "bytes31",
          key: web3.utils.soliditySha3("Key for bytes31"), 
          value: web3.eth.abi.encodeParameter('bytes31', '0x' + 'ff'.repeat(31) ) 
        },
        { 
          name: "bytes32",
          key: web3.utils.soliditySha3("Key for bytes32"), 
          value: web3.eth.abi.encodeParameter('bytes32', '0x' + 'ff'.repeat(32) ) 
        },
      ];

      runs.forEach( run => {
        it("should set a " + run.name + " value in storage", async () => {
          let key = run.key;
          let value = run.value;

          await account.setData([key], [value], { from: owner })

          const [result] = await account.getData([key])
          assert.equal(result, value)
        })
      })
    })

    context("uintN", async () => {

      const NUMBER = 8;

      let runs = [
        { 
          name: "uint8", // to display on unit test
          key: web3.utils.soliditySha3("Key for uint8"), 
          value: web3.eth.abi.encodeParameter('uint8', NUMBER ) 
        },
        { 
          name: "uint16",
          key: web3.utils.soliditySha3("Key for uint16"), 
          value: web3.eth.abi.encodeParameter('uint16', NUMBER ) 
        },
        { 
          name: "uint24",
          key: web3.utils.soliditySha3("Key for uint24"), 
          value: web3.eth.abi.encodeParameter('uint24', NUMBER ) 
        },
        { 
          name: "uint32",
          key: web3.utils.soliditySha3("Key for uint32"), 
          value: web3.eth.abi.encodeParameter('uint32', NUMBER ) 
        },
        { 
          name: "uint40",
          key: web3.utils.soliditySha3("Key for uint40"), 
          value: web3.eth.abi.encodeParameter('uint40', NUMBER ) 
        },
        { 
          name: "uint48",
          key: web3.utils.soliditySha3("Key for uint48"), 
          value: web3.eth.abi.encodeParameter('uint48', NUMBER ) 
        },
        { 
          name: "uint56",
          key: web3.utils.soliditySha3("Key for uint56"), 
          value: web3.eth.abi.encodeParameter('uint56', NUMBER ) 
        },
        { 
          name: "uint64",
          key: web3.utils.soliditySha3("Key for uint64"), 
          value: web3.eth.abi.encodeParameter('uint64', NUMBER ) 
        },
        { 
          name: "uint72",
          key: web3.utils.soliditySha3("Key for uint72"), 
          value: web3.eth.abi.encodeParameter('uint72', NUMBER ) 
        },
        { 
          name: "uint80",
          key: web3.utils.soliditySha3("Key for uint80"), 
          value: web3.eth.abi.encodeParameter('uint80', NUMBER ) 
        },       
        { 
          name: "uint88",
          key: web3.utils.soliditySha3("Key for uint88"), 
          value: web3.eth.abi.encodeParameter('uint88', NUMBER ) 
        },
        { 
          name: "uint96",
          key: web3.utils.soliditySha3("Key for uint96"), 
          value: web3.eth.abi.encodeParameter('uint96', NUMBER ) 
        },
        { 
          name: "uint104",
          key: web3.utils.soliditySha3("Key for uint104"), 
          value: web3.eth.abi.encodeParameter('uint104', NUMBER ) 
        },
        { 
          name: "uint112",
          key: web3.utils.soliditySha3("Key for uint112"), 
          value: web3.eth.abi.encodeParameter('uint112', NUMBER ) 
        },
        { 
          name: "uint120",
          key: web3.utils.soliditySha3("Key for uint120"), 
          value: web3.eth.abi.encodeParameter('uint120', NUMBER ) 
        },
        { 
          name: "uint128",
          key: web3.utils.soliditySha3("Key for uint128"), 
          value: web3.eth.abi.encodeParameter('uint128', NUMBER ) 
        },
        { 
          name: "uint136",
          key: web3.utils.soliditySha3("Key for uint136"), 
          value: web3.eth.abi.encodeParameter('uint136', NUMBER ) 
        },
        { 
          name: "uint144",
          key: web3.utils.soliditySha3("Key for uint144"), 
          value: web3.eth.abi.encodeParameter('uint144', NUMBER ) 
        },
        { 
          name: "uint152",
          key: web3.utils.soliditySha3("Key for uint152"), 
          value: web3.eth.abi.encodeParameter('uint152', NUMBER ) 
        },
        { 
          name: "uint160",
          key: web3.utils.soliditySha3("Key for uint160"), 
          value: web3.eth.abi.encodeParameter('uint160', NUMBER ) 
        },
        { 
          name: "uint168",
          key: web3.utils.soliditySha3("Key for uint168"), 
          value: web3.eth.abi.encodeParameter('uint168', NUMBER ) 
        },
        { 
          name: "uint176",
          key: web3.utils.soliditySha3("Key for uint176"), 
          value: web3.eth.abi.encodeParameter('uint176', NUMBER ) 
        },
        { 
          name: "uint184",
          key: web3.utils.soliditySha3("Key for uint184"), 
          value: web3.eth.abi.encodeParameter('uint184', NUMBER ) 
        },
        { 
          name: "uint192",
          key: web3.utils.soliditySha3("Key for uint192"), 
          value: web3.eth.abi.encodeParameter('uint192', NUMBER ) 
        },
        { 
          name: "uint200",
          key: web3.utils.soliditySha3("Key for uint200"), 
          value: web3.eth.abi.encodeParameter('uint200', NUMBER ) 
        },
        { 
          name: "uint208",
          key: web3.utils.soliditySha3("Key for uint208"), 
          value: web3.eth.abi.encodeParameter('uint208', NUMBER ) 
        },
        { 
          name: "uint216",
          key: web3.utils.soliditySha3("Key for uint216"), 
          value: web3.eth.abi.encodeParameter('uint216', NUMBER ) 
        },
        { 
          name: "uint224",
          key: web3.utils.soliditySha3("Key for uint224"), 
          value: web3.eth.abi.encodeParameter('uint224', NUMBER ) 
        },
        { 
          name: "uint232",
          key: web3.utils.soliditySha3("Key for uint232"), 
          value: web3.eth.abi.encodeParameter('uint232', NUMBER ) 
        },
        { 
          name: "uint240",
          key: web3.utils.soliditySha3("Key for uint240"), 
          value: web3.eth.abi.encodeParameter('uint240', NUMBER ) 
        },
        { 
          name: "uint248",
          key: web3.utils.soliditySha3("Key for uint248"), 
          value: web3.eth.abi.encodeParameter('uint248', NUMBER ) 
        },
        { 
          name: "uint256",
          key: web3.utils.soliditySha3("Key for uint256"), 
          value: web3.eth.abi.encodeParameter('uint256', NUMBER ) 
        },
      ];

      runs.forEach( run => {
        it("should set a " + run.name + " value in storage", async () => {
          let key = run.key;
          let value = run.value;

          await account.setData([key], [value], { from: owner })

          const [result] = await account.getData([key])
          assert.equal(result, value)
        })
      })
    })

    context("intN", async () => {

      const NUMBER_INT = -10;

      let runs = [
        { 
          name: "int8", // to display on unit test
          key: web3.utils.soliditySha3("Key for int8"), 
          value: web3.eth.abi.encodeParameter('int8', NUMBER_INT ) 
        },
        { 
          name: "int16",
          key: web3.utils.soliditySha3("Key for int16"), 
          value: web3.eth.abi.encodeParameter('int16', NUMBER_INT ) 
        },
        { 
          name: "int24",
          key: web3.utils.soliditySha3("Key for int24"), 
          value: web3.eth.abi.encodeParameter('int24', NUMBER_INT ) 
        },
        { 
          name: "int32",
          key: web3.utils.soliditySha3("Key for int32"), 
          value: web3.eth.abi.encodeParameter('int32', NUMBER_INT ) 
        },
        { 
          name: "int40",
          key: web3.utils.soliditySha3("Key for int40"), 
          value: web3.eth.abi.encodeParameter('int40', NUMBER_INT ) 
        },
        { 
          name: "int48",
          key: web3.utils.soliditySha3("Key for int48"), 
          value: web3.eth.abi.encodeParameter('int48', NUMBER_INT ) 
        },
        { 
          name: "int56",
          key: web3.utils.soliditySha3("Key for int56"), 
          value: web3.eth.abi.encodeParameter('int56', NUMBER_INT ) 
        },
        { 
          name: "int64",
          key: web3.utils.soliditySha3("Key for int64"), 
          value: web3.eth.abi.encodeParameter('int64', NUMBER_INT ) 
        },
        { 
          name: "int72",
          key: web3.utils.soliditySha3("Key for int72"), 
          value: web3.eth.abi.encodeParameter('int72', NUMBER_INT ) 
        },
        { 
          name: "int80",
          key: web3.utils.soliditySha3("Key for int80"), 
          value: web3.eth.abi.encodeParameter('int80', NUMBER_INT ) 
        },       
        { 
          name: "int88",
          key: web3.utils.soliditySha3("Key for int88"), 
          value: web3.eth.abi.encodeParameter('int88', NUMBER_INT ) 
        },
        { 
          name: "int96",
          key: web3.utils.soliditySha3("Key for int96"), 
          value: web3.eth.abi.encodeParameter('int96', NUMBER_INT ) 
        },
        { 
          name: "int104",
          key: web3.utils.soliditySha3("Key for int104"), 
          value: web3.eth.abi.encodeParameter('int104', NUMBER_INT ) 
        },
        { 
          name: "int112",
          key: web3.utils.soliditySha3("Key for int112"), 
          value: web3.eth.abi.encodeParameter('int112', NUMBER_INT ) 
        },
        { 
          name: "int120",
          key: web3.utils.soliditySha3("Key for int120"), 
          value: web3.eth.abi.encodeParameter('int120', NUMBER_INT ) 
        },
        { 
          name: "int128",
          key: web3.utils.soliditySha3("Key for int128"), 
          value: web3.eth.abi.encodeParameter('int128', NUMBER_INT ) 
        },
        { 
          name: "int136",
          key: web3.utils.soliditySha3("Key for int136"), 
          value: web3.eth.abi.encodeParameter('int136', NUMBER_INT ) 
        },
        { 
          name: "int144",
          key: web3.utils.soliditySha3("Key for int144"), 
          value: web3.eth.abi.encodeParameter('int144', NUMBER_INT ) 
        },
        { 
          name: "int152",
          key: web3.utils.soliditySha3("Key for int152"), 
          value: web3.eth.abi.encodeParameter('int152', NUMBER_INT ) 
        },
        { 
          name: "int160",
          key: web3.utils.soliditySha3("Key for int160"), 
          value: web3.eth.abi.encodeParameter('int160', NUMBER_INT ) 
        },
        { 
          name: "int168",
          key: web3.utils.soliditySha3("Key for int168"), 
          value: web3.eth.abi.encodeParameter('int168', NUMBER_INT ) 
        },
        { 
          name: "int176",
          key: web3.utils.soliditySha3("Key for int176"), 
          value: web3.eth.abi.encodeParameter('int176', NUMBER_INT ) 
        },
        { 
          name: "int184",
          key: web3.utils.soliditySha3("Key for int184"), 
          value: web3.eth.abi.encodeParameter('int184', NUMBER_INT ) 
        },
        { 
          name: "int192",
          key: web3.utils.soliditySha3("Key for int192"), 
          value: web3.eth.abi.encodeParameter('int192', NUMBER_INT ) 
        },
        { 
          name: "int200",
          key: web3.utils.soliditySha3("Key for int200"), 
          value: web3.eth.abi.encodeParameter('int200', NUMBER_INT ) 
        },
        { 
          name: "int208",
          key: web3.utils.soliditySha3("Key for int208"), 
          value: web3.eth.abi.encodeParameter('int208', NUMBER_INT ) 
        },
        { 
          name: "int216",
          key: web3.utils.soliditySha3("Key for int216"), 
          value: web3.eth.abi.encodeParameter('int216', NUMBER_INT ) 
        },
        { 
          name: "int224",
          key: web3.utils.soliditySha3("Key for int224"), 
          value: web3.eth.abi.encodeParameter('int224', NUMBER_INT ) 
        },
        { 
          name: "int232",
          key: web3.utils.soliditySha3("Key for int232"), 
          value: web3.eth.abi.encodeParameter('int232', NUMBER_INT ) 
        },
        { 
          name: "int240",
          key: web3.utils.soliditySha3("Key for int240"), 
          value: web3.eth.abi.encodeParameter('int240', NUMBER_INT ) 
        },
        { 
          name: "int248",
          key: web3.utils.soliditySha3("Key for int248"), 
          value: web3.eth.abi.encodeParameter('int248', NUMBER_INT ) 
        },
        { 
          name: "int256",
          key: web3.utils.soliditySha3("Key for int256"), 
          value: web3.eth.abi.encodeParameter('int256', NUMBER_INT ) 
        },
      ];

      runs.forEach( run => {
        it("should set a " + run.name + " value in storage", async () => {
          let key = run.key;
          let value = run.value;

          await account.setData([key], [value], { from: owner })

          const [result] = await account.getData([key])
          assert.equal(result, value)
        })
      })
    });

    context("abi-encoded arrays", async () => {
      const KEY_ADDRESSES = web3.utils.soliditySha3("key addresses");
      const KEY_BYTES4 = web3.utils.soliditySha3("key bytes4");
      const KEY_BYTES32 = web3.utils.soliditySha3("key bytes32");

      context("address[]", async () => {
        it("should set 5 x addresses", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('address[]', [
            accounts[0], accounts[1], accounts[2], accounts[3], accounts[4]
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });

        it("should update one of the 5 x addresses", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('address[]', [
            accounts[0], accounts[1], accounts[2], accounts[9], accounts[4]
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });

        it("should add +1 address", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('address[]', [
            accounts[0], accounts[1], accounts[2], accounts[9], accounts[4], accounts[5]
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });

        it("should remove -1 address", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('address[]', [
            // remove accounts[9]
            accounts[0], accounts[1], accounts[2], accounts[4], accounts[5]
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });
      });

      context("bytes4[]", async () => {
        it("should set 5 x bytes4 values", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes4[]', [
            "0xaaaaaaaa", "0xbbbbbbbb", "0xcccccccc", "0xdddddddd", "0xeeeeeeee"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });

        it("should update one of the 5 x bytes4 values", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes4[]', [
            "0xaaaaaaaa", "0xbbbbbbbb", "0xcccccccc", "0x11111111", "0xeeeeeeee"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });

        it("should add +1 bytes4 value", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes4[]', [
            "0xaaaaaaaa", "0xbbbbbbbb", "0xcccccccc", "0x11111111", "0xeeeeeeee", "0xffffffff"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });

        it("should remove -1 bytes4 value", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes4[]', [
            // remove "0x11111111"
            "0xaaaaaaaa", "0xbbbbbbbb", "0xcccccccc", "0xeeeeeeee", "0xffffffff"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });
      });

      context("bytes32[]", async () => {
        it("should set 5 x bytes32 values", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes32[]', [
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });  

        it("should update one of the 5 x bytes32 values", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes32[]', [
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            "0x1111111111111111111111111111111111111111111111111111111111111111",
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });  
  
        it("should add +1 bytes32 value", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes32[]', [
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            "0x1111111111111111111111111111111111111111111111111111111111111111",
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });
  
        it("should remove -1 bytes32 value", async () => {
          let key = KEY_ADDRESSES
          let value = web3.eth.abi.encodeParameter('bytes32[]', [
            // remove "0x1111111111111111111111111111111111111111111111111111111111111111"
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          ]);
  
          await account.setData([key], [value], { from: owner })
  
          const [result] = await account.getData([key])
          assert.equal(result, value)
        });
      });

    });

  });

});

contract("ERC725Y (from Smart Contract)", (accounts) => {
  const owner = accounts[1];

  let account;
  let reader;

  before(async () => {
    account = await ERC725Y.new(owner, { from: owner });
    reader = await ReaderContract.new(account.address, { from: owner });
  });

  context("reading ERC725Y storage from a Smart Contract", async () => {

    context("fetching bytesN values", async () => {
      const KEYS = [
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444444444444444444444444444",
        "0x5555555555555555555555555555555555555555555555555555555555555555",
      ];
  
      const VALUES = [
        "0x" + "11".repeat(1),
        "0x" + "11".repeat(32),
        "0x" + "11".repeat(64),
        "0x" + "11".repeat(96),
        "0x" + "11".repeat(128),
      ];
  
      before(async () => {
        account = await ERC725Y.new(owner, { from: owner });
        reader = await ReaderContract.new(account.address, { from: owner });
  
        await account.setData(KEYS, VALUES, { from: owner });
      });
  
      for (let ii = 0; ii < VALUES.length; ii++) {
        let bytesLength = VALUES[ii].substring(2).length / 2;
  
        it(`should read ${bytesLength} bytes value`, async () => {
          let key = KEYS[ii];
          let expectedValue = VALUES[ii];
  
          // execute as a transaction to change the state,
          // and display the gas costs in the gas reporter
          await reader.read(key);
  
          const result = await reader.read.call(key);
          assert.equal(result, expectedValue);
        });
      }
    });

    context("fetching Solidity value types (stored as raw bytes)", async () => {
      const runs = [
        { 
          name: "address",
          key: web3.utils.soliditySha3("address"),
          value: accounts[0]
        },
        { 
          name: "bytes4",
          key: web3.utils.soliditySha3("bytes4"),
          value: "0xaabbccdd"
        },
        { 
          name: "bytes32",
          key: web3.utils.soliditySha3("bytes32"),
          value: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        }
      ];

      before(async () => {
        account = await ERC725Y.new(owner, { from: owner });
        await account.setData(
          [
            runs[0].key,
            runs[1].key,
            runs[2].key,
          ],
          [
            runs[0].value,
            runs[1].value,
            runs[2].value,
          ],
          { from: owner }
        );

        reader = await ReaderContract.new(account.address,{ from: owner });
      });
  
      runs.forEach(run => {
        it("should call ERC725Y contract and fetch a " + run.name + " value its storage", async () => {
          let key = run.key;
          let expectedValue = run.value;
  
          // execute as a transaction to change the state,
          // and display the gas costs in the gas reporter
          await reader.read(key);
  
          const result = await reader.read.call(key);
          assert.equal(result, expectedValue);
        });
      });
    });

    
    
  });

  context("writing to ERC725Y storage from a smart contract", async () => {
    let account;
    let erc725YWriter;
    let erc725YReader;
    let count = 1000000000;

    before(async () => {
      erc725YWriter = await ERC725YWriter.new();
      erc725YReader = await ERC725YReader.new();
    });

    beforeEach(async () => {
      account = await ERC725Y.new(erc725YWriter.address, {
        from: owner,
      });
      assert.equal(await account.owner.call(), erc725YWriter.address);
    });

    it("Should be able to setData and getData of 3 assets from Smart contracts", async () => {
      let keys = [];
      let values = [];

      for (let i = 8; i <= 10; i++) {
        keys.push(web3.utils.numberToHex(count++));
        values.push(web3.utils.numberToHex(count + 1000));
      }
      await erc725YWriter.callSetData(account.address, keys, values);

      const result = await erc725YReader.callGetData(account.address, keys);
      assert.deepEqual(result, values);
    });

    it("Should be able to setData (Array of 3 assets of different lengths) from Smart contracts", async () => {
      let multipleKeys = [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      ];
      let multipleValues = [
        "0xabcdef",
        "0x0123456789abcdef",
        "0xabcdefabcdefabcdef123456789123456789",
      ];

      await erc725YWriter.callSetData(
        account.address,
        multipleKeys,
        multipleValues
      );

      let fetchedResult = await erc725YReader.callGetData(
        account.address,
        multipleKeys
      );
      assert.deepEqual(fetchedResult, multipleValues);
    });

    it("Should be able to setData and getData of 1 asset from Smart contracts", async () => {
      let key = [web3.utils.numberToHex(count++)];
      let value = [web3.utils.numberToHex(count + 11)];

      await erc725YWriter.callSetData(account.address, key, value);

      const result = await erc725YReader.callGetData(account.address, key);
      assert.deepEqual(result, value);
    });

    it("Should be able to setData (constructed) in a smart contract", async () => {
      let key = [web3.utils.keccak256("MyName")];
      let value = [web3.utils.utf8ToHex("LUKSO")];

      await erc725YWriter.setDataComputed(account.address);
      let result = await erc725YReader.callGetData(account.address, key);
      assert.deepEqual(result, value);
    });
  });
});
