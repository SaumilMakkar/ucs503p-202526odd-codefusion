import * as z from "zod";
import { useEffect, useState } from "react";
import { Calendar, Loader, Mic, Square } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import RecieptScanner from "./reciept-scanner";
import {
  _TRANSACTION_FREQUENCY,
  _TRANSACTION_TYPE,
  CATEGORIES,
  PAYMENT_METHODS,
} from "@/constant";
import { Switch } from "../ui/switch";
import CurrencyInputField from "../ui/currency-input";
import { SingleSelector } from "../ui/single-select";
import { AIScanReceiptData } from "@/features/transaction/transactionType";
import { useCreateTransactionMutation, useGetSingleTransactionQuery, useUpdateTransactionMutation } from "@/features/transaction/transactionAPI";
import { toast } from "sonner";
import { useDispatch } from 'react-redux';
import { transactionApi } from '@/features/transaction/transactionAPI';
import { useVoiceInput } from "@/hooks/use-voice-input";
import { parseVoiceTransaction, mapCategoryToFormValue, mapPaymentMethodToFormValue } from "@/utils/voice-parser";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  type: z.enum([_TRANSACTION_TYPE.INCOME, _TRANSACTION_TYPE.EXPENSE]),
  category: z.string().min(1, { message: "Please select a category." }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  paymentMethod: z
    .string()
    .min(1, { message: "Please select a payment method." }),
  isRecurring: z.boolean(),
  frequency: z
    .enum([
      _TRANSACTION_FREQUENCY.DAILY,
      _TRANSACTION_FREQUENCY.WEEKLY,
      _TRANSACTION_FREQUENCY.MONTHLY,
      _TRANSACTION_FREQUENCY.YEARLY,
    ])
    .nullable()
    .optional(),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TransactionForm = (props: { 
  isEdit?: boolean; 
  transactionId?: string
  onCloseDrawer?: () => void;
  
 }) => {
  const {onCloseDrawer, isEdit = false, transactionId } = props;
  const dispatch = useDispatch();

  const [isScanning, setIsScanning] = useState(false);

  const {data, isLoading } = useGetSingleTransactionQuery(
    transactionId || "",{skip: !transactionId}
  );
  const editData = data?.transaction;

  const [createTransaction, { isLoading: isCreating }] =
    useCreateTransactionMutation();

  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateTransactionMutation();

  // Voice input integration
  const { isListening, transcript, startListening, stopListening, error: voiceError } = useVoiceInput();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      type: _TRANSACTION_TYPE.INCOME,
      category: "",
      date: new Date(),
      paymentMethod: "" ,// Set default payment method
      isRecurring: false,
      frequency: null,
      description: "",
      receiptUrl: "",

    },
  });

  useEffect(() => {
    if (isEdit && transactionId) {

      form.reset({
        title: editData?.title,
        amount: editData?.amount?.toString(),
        type: editData?.type,
        category: editData?.category?.toLowerCase(),
        date: editData?.date ? new Date(editData.date) : new Date(),
        paymentMethod: editData?.paymentMethod,
        
        isRecurring: editData?.isRecurring,
        frequency: editData?.recurringInterval,
        description: editData?.description, 
        
      })
    }
  }, [editData, form, isEdit, transactionId]);

  // Parse voice input when transcript is available
  useEffect(() => {
    if (!isListening && transcript && transcript.trim().length > 0) {
      const parsed = parseVoiceTransaction(transcript);
      
      if (parsed.amount || parsed.category || parsed.type) {
        // Fill form with parsed data
        if (parsed.title) form.setValue('title', parsed.title, { shouldValidate: true });
        if (parsed.amount) form.setValue('amount', parsed.amount.toString(), { shouldValidate: true });
        if (parsed.type) form.setValue('type', parsed.type as any, { shouldValidate: true });
        if (parsed.category) {
          const mappedCategory = mapCategoryToFormValue(parsed.category);
          form.setValue('category', mappedCategory, { shouldValidate: true });
        }
        if (parsed.paymentMethod) {
          const mapped = mapPaymentMethodToFormValue(parsed.paymentMethod);
          form.setValue('paymentMethod', mapped, { shouldValidate: true });
        }
        if (parsed.date) form.setValue('date', parsed.date, { shouldValidate: true });
        if (parsed.description) form.setValue('description', parsed.description, { shouldValidate: true });
        
        toast.success('Voice input captured! Review the details.');
      } else {
        toast.info('Could not extract transaction details. Please try again with more details.');
      }
    }
  }, [isListening, transcript, form]);

  const frequencyOptions = Object.entries(_TRANSACTION_FREQUENCY).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_, value]) => ({
      value: value,
      label: value.replace("_", " ").toLowerCase(),
    })
  );

  const handleScanComplete = (data: AIScanReceiptData) => {
    form.reset({
      ...form.getValues(),
      title: data.title || "",
      amount: data.amount.toString(),
      type: data.type || _TRANSACTION_TYPE.EXPENSE,
      category: data.category?.toLowerCase() || "",
      date: new Date(data.date),
      paymentMethod: data.paymentMethod || "",
      isRecurring: false,
      frequency: null,
      description: data.description || "",
      receiptUrl: data.receiptUrl || "",
    })
  };
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (isCreating) return;
    console.log("Form submitted:", values);
    const payload = {
      title: values.title,
      type: values.type,
      category: values.category,
      paymentMethod: values.paymentMethod,
      description: values.description || "",
      amount: Number(values.amount),
      date: values.date.toISOString(),
      isRecurring: values.isRecurring || false,
      recurringInterval: values.frequency || null,
    };
    if (isEdit && transactionId) {
      console.log("Edit transaction:", payload);
      onCloseDrawer?.();
      updateTransaction({id: transactionId, transaction: payload})
      .unwrap()
      .then(() => {
        onCloseDrawer?.();
        toast.success("Transaction updated successfully");
      })
      .catch((error) => {
        console.error("Transaction update failed:", error);
        toast.error(error.data.message || "Failed to update transaction");
      });
      return;
    }
    createTransaction(payload)
      .unwrap()
      .then((response) => {
        console.log("Transaction created:", response);
        console.log("Cache should be invalidated now");
        form.reset();
        dispatch(transactionApi.util.invalidateTags(['transactions']));
        onCloseDrawer?.();
        toast.success("Transaction created successfully");
        // Refresh the page after transaction is added
        window.location.reload();
      })
      .catch((error) => {
        console.error("Transaction creation failed:", error);
        toast.error(error.data.message || "Failed to create transaction");
      });
    
  };

  return (
    <div className="relative pb-10 pt-5 px-2.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
          <div className="space-y-6">
            {/* Receipt Upload Section */}
            {!isEdit && (
              <RecieptScanner
              loadingChange={isScanning}
                onScanComplete={handleScanComplete}
                onLoadingChange={setIsScanning}
              />
            )}

            {/* Voice Input Section */}
            {!isEdit && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    variant="outline"
                    disabled={isScanning}
                    className="flex-1"
                  >
                    {isListening ? (
                      <>
                        <Square className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Voice Input
                      </>
                    )}
                  </Button>
                </div>
                {isListening && (
                  <div className="text-xs text-muted-foreground">
                    🎤 Listening... Speak your transaction details
                  </div>
                )}
                {transcript && !isListening && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    📝 "{transcript}"
                  </div>
                )}
                {voiceError && (
                  <div className="text-xs text-destructive">
                    ⚠️ {voiceError}
                  </div>
                )}
                {!isListening && (
                  <p className="text-xs text-muted-foreground">
                    💡 Example: "Spent 500 rupees on groceries at Walmart today, paid by card"
                  </p>
                )}
              </div>
            )}

            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Transaction Type</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-2"
                    disabled={isScanning}
                  >
                    <label
                      htmlFor={_TRANSACTION_TYPE.INCOME}
                      className={cn(
                        `text-sm font-normal leading-none cursor-pointer
                        flex items-center space-x-2 rounded-md 
                        shadow-sm border p-2 flex-1 justify-center 
                        `,
                        field.value === _TRANSACTION_TYPE.INCOME &&
                          "!border-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={_TRANSACTION_TYPE.INCOME}
                        id={_TRANSACTION_TYPE.INCOME}
                        className="!border-primary"
                      />
                      Income
                    </label>

                    <label
                      htmlFor={_TRANSACTION_TYPE.EXPENSE}
                      className={cn(
                        `text-sm font-normal leading-none cursor-pointer
                        flex items-center space-x-2 rounded-md 
                        shadow-sm border p-2 flex-1 justify-center 
                        `,
                        field.value === _TRANSACTION_TYPE.EXPENSE &&
                          "!border-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={_TRANSACTION_TYPE.EXPENSE}
                        id={_TRANSACTION_TYPE.EXPENSE}
                        className="!border-primary"
                      />
                      Expense
                    </label>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-normal">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Transaction title"
                      {...field}
                      disabled={isScanning}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CurrencyInputField
                        {...field}
                        disabled={isScanning}
                        onValueChange={(value) => field.onChange(value || "")}
                        placeholder="₹0.00"
                        prefix="₹"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <SingleSelector
                    value={CATEGORIES.find((opt) => opt.value === field.value) || field.value ? {value: field.value, label: field.value} : undefined}
                    
                    onChange={(option) => field.onChange(option.value)}
                    options={CATEGORIES}
                    placeholder="Select or type a category"
                    creatable
                    disabled={isScanning}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover modal={false}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 !pointer-events-auto" 
                    align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          console.log(date)
                          field.onChange(date); // This updates the form value
                        }}
                        disabled={(date) => date < new Date("2023-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isScanning}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[14.5px]">
                      Recurring Transaction
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {field.value
                        ? "This will repeat automatically"
                        : "Set recurring to repeat this transaction"}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      disabled={isScanning}
                      checked={field.value}
                      className="cursor-pointer"
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue(
                            "frequency",
                            _TRANSACTION_FREQUENCY.DAILY
                          );
                        }else{
                          form.setValue("frequency", null);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && form.getValues().isRecurring && (
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem className="recurring-control">
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                      disabled={isScanning}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select frequency"
                            className="!capitalize"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencyOptions.map(({ value, label }) => (
                          <SelectItem
                            key={value}
                            value={value}
                            className="!capitalize"
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this transaction"
                      className="resize-none"
                      disabled={isScanning}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-background pb-2">
            <Button type="submit" className="w-full !text-white" disabled={isScanning||isCreating||isUpdating}>
              {isEdit ? "Update" : "Save"}
            </Button>
          </div>
          {isLoading&&<div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
          </div>}
        </form>
      </Form>
    </div>
  );
};

export default TransactionForm;
