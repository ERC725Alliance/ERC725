const { assert, expect } = require("chai");
const { expectRevert } = require("openzeppelin-test-helpers");

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
  let reader;

  before(async () => {
    account = await ERC725Y.new(owner, { from: owner });
    reader = await ReaderContract.new(account.address, { from: owner });
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

  context("writing 1 x key to ERC725Y storage from an EOA", async () => {
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

  context("writing multiples keys to ERC725Y storage from an EOA", async () => {
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

  context("write to ERC725Y storage, 32 bytes words at a time", async () => {
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
});

contract("ERC725Y (from Smart Contract", (accounts) => {
  const owner = accounts[1];

  let account;
  let reader;

  before(async () => {
    account = await ERC725Y.new(owner, { from: owner });
    reader = await ReaderContract.new(account.address, { from: owner });
  });

  context("reading ERC725Y storage from a Smart Contract", async () => {
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
