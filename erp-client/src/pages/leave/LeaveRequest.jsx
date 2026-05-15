import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApplyLeave, useLeaveBalances, useLeaveTypes } from '../../hooks/useLeave';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ChevronLeft, Send } from 'lucide-react';

const LeaveRequest = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { applyLeave, isApplying } = {
    applyLeave: useApplyLeave().mutate,
    isApplying: useApplyLeave().isPending
  };
  const { data: balances } = useLeaveBalances();
  const { data: leaveTypes } = useLeaveTypes();

  const onSubmit = (data) => {
    applyLeave(data, {
      onSuccess: () => navigate('/leave')
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-gray-500">Submit a new leave request for approval</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select 
                className="input" 
                {...register('leave_type_id', { required: 'Required' })}
              >
                <option value="">Select Type</option>
                {leaveTypes?.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.leave_type_id && <p className="text-xs text-red-500 mt-1">{errors.leave_type_id.message}</p>}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="font-medium">Available Balance</p>
                <p className="text-xs">Check your leave balances before applying</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Start Date" 
              type="date" 
              {...register('from_date', { required: 'Required' })} 
              error={errors.from_date} 
            />
            <Input 
              label="End Date" 
              type="date" 
              {...register('to_date', { required: 'Required' })} 
              error={errors.to_date} 
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea 
              className="input min-h-[120px] py-2" 
              placeholder="Provide a reason for your leave request..."
              {...register('reason', { required: 'Reason is required' })}
            ></textarea>
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <Button variant="secondary" onClick={() => navigate('/leave')}>Cancel</Button>
            <Button type="submit" isLoading={isApplying} className="gap-2 px-8">
              <Send size={18} />
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequest;
